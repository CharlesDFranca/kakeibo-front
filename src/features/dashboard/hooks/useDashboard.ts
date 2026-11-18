import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { dashboardApi, type FinanceDashboard, type GoalSummary } from '../api/dashboard.api';
import { rangeFor, type PeriodId } from '../periods';

type Async<T> =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; data: T };

/** Resumo financeiro do período escolhido. */
export function useFinanceDashboard(period: PeriodId, reloadKey = 0) {
    const [state, setState] = useState<Async<FinanceDashboard>>({ status: 'loading' });

    useEffect(() => {
        let cancelled = false;
        setState({ status: 'loading' });

        dashboardApi
            .finance(rangeFor(period))
            .then((data) => !cancelled && setState({ status: 'ready', data }))
            .catch(
                (e: unknown) =>
                    !cancelled &&
                    setState({
                        status: 'error',
                        message: e instanceof Error ? e.message : 'Erro ao carregar o painel.',
                    }),
            );

        return () => {
            cancelled = true; // descarta respostas de períodos antigos
        };
    }, [period, reloadKey]);

    return state;
}

/** Metas em andamento. Só consulta se o plano inclui metas (senão a API devolve 403). */
export function useGoalsDashboard(reloadKey = 0) {
    const { user } = useAuth();
    const allowed = user?.features.includes('GOALS') ?? false;
    const [state, setState] = useState<Async<GoalSummary[]>>({ status: 'loading' });

    useEffect(() => {
        if (!allowed) return;
        let cancelled = false;
        setState({ status: 'loading' });

        dashboardApi
            .goals()
            .then((data) => !cancelled && setState({ status: 'ready', data }))
            .catch(
                (e: unknown) =>
                    !cancelled &&
                    setState({
                        status: 'error',
                        message: e instanceof Error ? e.message : 'Erro ao carregar as metas.',
                    }),
            );

        return () => {
            cancelled = true;
        };
    }, [allowed, reloadKey]);

    return { allowed, state };
}
