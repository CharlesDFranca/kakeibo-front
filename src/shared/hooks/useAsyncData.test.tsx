import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/api-error';
import { t } from '@/shared/i18n';
import { useAsyncData } from './useAsyncData';

/** Promessa que o teste resolve na hora que quiser, para controlar a ordem das respostas. */
function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

describe('useAsyncData', () => {
    it('começa carregando e entrega os dados', async () => {
        const { result } = renderHook(() => useAsyncData(() => Promise.resolve(['a']), []));

        expect(result.current.state).toEqual({ status: 'loading' });
        await waitFor(() => expect(result.current.state).toEqual({ status: 'ready', data: ['a'], refreshing: false }));
    });

    it('erro vira mensagem traduzida no idioma atual', async () => {
        const { result } = renderHook(() => useAsyncData(() => Promise.reject(new ApiError('INVALID_CREDENTIALS', 'x', 401)), []));

        await waitFor(() => expect(result.current.state).toEqual({ status: 'error', message: t('error.INVALID_CREDENTIALS') }));
    });

    it('reload busca de novo e mantém os dados antigos na tela enquanto isso', async () => {
        const second = deferred<string>();
        const fetcher = vi.fn().mockResolvedValueOnce('antigo').mockReturnValueOnce(second.promise);
        const { result } = renderHook(() => useAsyncData(fetcher, []));
        await waitFor(() => expect(result.current.state).toMatchObject({ status: 'ready', data: 'antigo' }));

        act(() => result.current.reload());

        expect(result.current.state).toEqual({ status: 'ready', data: 'antigo', refreshing: true });
        await act(async () => second.resolve('novo'));
        expect(result.current.state).toEqual({ status: 'ready', data: 'novo', refreshing: false });
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('buscar de novo quando as dependências mudam', async () => {
        const fetcher = vi.fn(async (filter: string) => `lista ${filter}`);
        const { result, rerender } = renderHook(({ filter }) => useAsyncData(() => fetcher(filter), [filter]), { initialProps: { filter: 'todas' } });
        await waitFor(() => expect(result.current.state).toMatchObject({ data: 'lista todas' }));

        rerender({ filter: 'concluídas' });

        await waitFor(() => expect(result.current.state).toMatchObject({ data: 'lista concluídas' }));
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('descarta a resposta antiga quando uma busca mais nova já começou', async () => {
        const slow = deferred<string>();
        const fast = deferred<string>();
        const fetcher = vi.fn().mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise);
        const { result, rerender } = renderHook(({ filter }) => useAsyncData(fetcher, [filter]), { initialProps: { filter: 'a' } });

        rerender({ filter: 'b' }); // segunda busca começa antes de a primeira responder
        await act(async () => fast.resolve('resposta de b'));
        await act(async () => slow.resolve('resposta velha de a')); // chega atrasada

        expect(result.current.state).toEqual({ status: 'ready', data: 'resposta de b', refreshing: false });
    });
});
