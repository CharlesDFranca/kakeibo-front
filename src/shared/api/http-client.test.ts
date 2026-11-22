import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, NetworkError } from './api-error';
import { request, setDemoResolver } from './http-client';

const jsonResponse = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function stubFetch(response: Response | Error) {
    const fetchMock = vi.fn(async () => {
        if (response instanceof Error) throw response;
        return response.clone(); // cada chamada recebe um corpo novo (o corpo de uma Response só pode ser lido uma vez)
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => setDemoResolver(null));

describe('request', () => {
    it('chama /api no mesmo domínio, com o cookie de sessão, e devolve só o `data` do envelope', async () => {
        const fetchMock = stubFetch(jsonResponse(200, { success: true, data: [{ id: '1' }] }));

        await expect(request('/wallets')).resolves.toEqual([{ id: '1' }]);

        expect(fetchMock).toHaveBeenCalledWith('/api/wallets', expect.objectContaining({ method: 'GET', credentials: 'include' }));
    });

    it('envia o corpo como JSON', async () => {
        const fetchMock = stubFetch(jsonResponse(201, { success: true, data: { id: 'w1' } }));

        await request('/wallets', { method: 'POST', body: { name: 'Conta', balance: '10.00' } });

        const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
        expect(init.method).toBe('POST');
        expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
        expect(JSON.parse(init.body as string)).toEqual({ name: 'Conta', balance: '10.00' });
    });

    it('204 não tem corpo e devolve undefined', async () => {
        stubFetch(new Response(null, { status: 204 }));
        await expect(request('/wallets/1', { method: 'DELETE' })).resolves.toBeUndefined();
    });

    it('erro da API vira ApiError com código, status e detalhes', async () => {
        stubFetch(
            jsonResponse(409, { success: false, errors: { code: 'EMAIL_ALREADY_EXISTS', type: 'CONFLICT', message: 'Email already exists.', details: { field: 'email' } } }),
        );

        const error = await request('/users', { method: 'POST', body: {} }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({ code: 'EMAIL_ALREADY_EXISTS', status: 409, details: { field: 'email' } });
    });

    it('resposta que não é o envelope esperado vira HTTP_<status>', async () => {
        stubFetch(new Response('<html>Bad gateway</html>', { status: 502 }));
        await expect(request('/wallets')).rejects.toMatchObject({ code: 'HTTP_502', status: 502 });
    });

    it('falha de rede vira NetworkError', async () => {
        stubFetch(new TypeError('Failed to fetch'));
        await expect(request('/wallets')).rejects.toBeInstanceOf(NetworkError);
    });
});

describe('modo demonstração (tutorial)', () => {
    it('responde na hora, sem rede, às chamadas de dados', async () => {
        const fetchMock = stubFetch(jsonResponse(200, { success: true, data: 'real' }));
        const resolver = vi.fn(() => ['exemplo']);
        setDemoResolver(resolver);

        await expect(request('/wallets')).resolves.toEqual(['exemplo']);

        expect(resolver).toHaveBeenCalledWith('/wallets', 'GET');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('sessão e usuário continuam indo à API de verdade', async () => {
        const fetchMock = stubFetch(jsonResponse(200, { success: true, data: { id: 'u1' } }));
        setDemoResolver(() => 'exemplo');

        await expect(request('/users/me')).resolves.toEqual({ id: 'u1' });
        await expect(request('/auth/login', { method: 'POST', body: {} })).resolves.toEqual({ id: 'u1' });

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('ao desligar, volta aos dados reais', async () => {
        const fetchMock = stubFetch(jsonResponse(200, { success: true, data: 'real' }));
        setDemoResolver(() => 'exemplo');
        setDemoResolver(null);

        await expect(request('/wallets')).resolves.toBe('real');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
