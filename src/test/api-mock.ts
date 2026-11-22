import { vi } from 'vitest';

/** Resposta simulada de uma rota da API (o envelope `{ success, data }` é montado aqui). */
export type Reply = { status?: number; data?: unknown; error?: { code: string; message?: string }; network?: boolean };

export type Call = { method: string; path: string; query: URLSearchParams; body: unknown };
type Handler = (call: Call) => Reply | Promise<Reply>;
type Route = Reply | Handler;

export const ok = (data?: unknown): Reply => ({ status: 200, data });
export const noContent = (): Reply => ({ status: 204 });
export const fail = (status: number, code: string, message = 'Erro simulado'): Reply => ({ status, error: { code, message } });
export const offline = (): Reply => ({ network: true });

/**
 * Troca o `fetch` global por um servidor de mentira. As rotas são `'MÉTODO /caminho'` (sem o prefixo /api e
 * sem a query), com uma resposta fixa ou uma função (para guardar estado: criar algo e listar de novo).
 * Rota que o teste não previu responde 404 e fica em `unmocked`, para o erro aparecer no teste certo.
 */
export function mockApi(routes: Record<string, Route> = {}) {
    const table = new Map<string, Route>(Object.entries(routes));
    const calls: Call[] = [];
    const unmocked: string[] = [];

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'http://localhost');
        const method = (init?.method ?? 'GET').toUpperCase();
        const path = url.pathname.replace(/^\/api(?=\/|$)/, '') || '/';
        const call: Call = { method, path, query: url.searchParams, body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined };
        calls.push(call);

        const route = table.get(`${method} ${path}`);
        if (!route) {
            unmocked.push(`${method} ${path}`);
            return json(404, { success: false, errors: { code: 'TEST_UNMOCKED', type: 'TEST', message: `Sem mock para ${method} ${path}` } });
        }

        const reply = typeof route === 'function' ? await route(call) : route;
        if (reply.network) throw new TypeError('Failed to fetch');
        if (reply.error) return json(reply.status ?? 400, { success: false, errors: { type: 'ERROR', message: 'Erro simulado', ...reply.error } });
        if (reply.status === 204) return new Response(null, { status: 204 });
        return json(reply.status ?? 200, { success: true, data: reply.data });
    });
    vi.stubGlobal('fetch', fetchMock);

    return {
        calls,
        unmocked,
        /** Troca (ou cria) a resposta de uma rota no meio do teste. */
        set(key: string, route: Route) {
            table.set(key, route);
        },
        /** Chamadas feitas a uma rota, na ordem. */
        to(key: string): Call[] {
            const [method, path] = key.split(' ');
            return calls.filter((c) => c.method === method && c.path === path);
        },
    };
}

export type MockApi = ReturnType<typeof mockApi>;

function json(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
