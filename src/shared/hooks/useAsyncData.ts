import { useCallback, useEffect, useState } from 'react';
import { apiErrorMessage } from '@/shared/i18n';

export type AsyncState<T> =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; data: T; refreshing: boolean };

/**
 * Busca dados e refaz a busca quando `deps` mudam ou `reload()` é chamado.
 * Enquanto recarrega, mantém os dados antigos na tela (`refreshing: true`).
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[]) {
    const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setState((s) => (s.status === 'ready' ? { ...s, refreshing: true } : { status: 'loading' }));

        fetcher()
            .then((data) => !cancelled && setState({ status: 'ready', data, refreshing: false }))
            .catch((e: unknown) => !cancelled && setState({ status: 'error', message: apiErrorMessage(e) }));

        return () => {
            cancelled = true; // descarta respostas antigas
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, tick]);

    const reload = useCallback(() => setTick((t) => t + 1), []);

    return { state, reload };
}
