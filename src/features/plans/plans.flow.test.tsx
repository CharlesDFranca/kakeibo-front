import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Plan } from '@/features/auth/api/auth.api';
import { t } from '@/shared/i18n';
import { fail, ok, type Call } from '@/test/api-mock';
import { userOn } from '@/test/fixtures';
import { inDialog, renderApp } from '@/test/render';
import { PLAN_INFO, planDiff } from './plans';

describe('planDiff', () => {
    it('Free → Pro ganha tudo e não perde nada', () => {
        expect(planDiff('FREE', 'PRO')).toEqual({ gained: ['TRANSFERS', 'CATEGORY_ANALYSIS', 'GOALS', 'NOTIFICATIONS'], lost: [] });
    });

    it('Pro → Plus perde metas e notificações', () => {
        expect(planDiff('PRO', 'PLUS')).toEqual({ gained: [], lost: ['GOALS', 'NOTIFICATIONS'] });
    });

    it('o mesmo plano não muda nada', () => {
        expect(planDiff('PLUS', 'PLUS')).toEqual({ gained: [], lost: [] });
    });
});

describe('planos', () => {
    /** Servidor com plano que muda: PATCH troca o plano e GET /users/me devolve o usuário atualizado. */
    function server(start: Plan) {
        let plan = start;
        return {
            'GET /users/me': () => ok(userOn(plan)),
            'PATCH /users/me/plan': (call: Call) => {
                plan = (call.body as { plan: Plan }).plan;
                return ok({ plan });
            },
        };
    }

    it('mostra os três planos e marca o atual', async () => {
        renderApp('/planos', { user: userOn('PLUS') });

        const current = await screen.findByRole('region', { name: t('plans.planAria', { plan: 'Plus' }) });
        expect(within(current).getAllByText(t('plans.current'))).toHaveLength(2); // selo + botão desativado
        expect(screen.getByRole('region', { name: t('plans.planAria', { plan: 'Free' }) })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: t('plans.planAria', { plan: 'Pro' }) })).toBeInTheDocument();
    });

    it('o botão do plano atual fica desativado', async () => {
        renderApp('/planos', { user: userOn('FREE') });

        const card = await screen.findByRole('region', { name: t('plans.planAria', { plan: 'Free' }) });
        expect(within(card).getByRole('button', { name: t('plans.current') })).toBeDisabled();
    });

    it('subir de plano: mostra o que se ganha, confirma, avisa e atualiza o plano atual', async () => {
        const { person, server: calls } = renderApp('/planos', { user: userOn('FREE'), api: server('FREE') });

        await person.click(await screen.findByRole('button', { name: t('plans.switchTo', { plan: 'Pro' }) }));
        expect(inDialog().getByText(t('plans.dialog.gain'))).toBeInTheDocument();
        expect(calls.to('PATCH /users/me/plan')).toHaveLength(0); // ainda não: falta confirmar
        await person.click(inDialog().getByRole('button', { name: t('plans.dialog.confirm') }));

        expect(await screen.findByText(t('plans.changed', { plan: PLAN_INFO.PRO.label }))).toBeInTheDocument();
        expect((calls.to('PATCH /users/me/plan')[0] as Call).body).toEqual({ plan: 'PRO' });
        const pro = await screen.findByRole('region', { name: t('plans.planAria', { plan: 'Pro' }) });
        expect(within(pro).getByRole('button', { name: t('plans.current') })).toBeDisabled();
    });

    it('descer de plano: avisa o que se perde e que os dados continuam guardados', async () => {
        const { person } = renderApp('/planos', { user: userOn('PRO'), api: server('PRO') });

        await person.click(await screen.findByRole('button', { name: t('plans.backTo', { plan: 'Free' }) }));

        expect(inDialog().getByText(t('plans.dialog.lose'))).toBeInTheDocument();
        expect(inDialog().getByText(t('plans.dialog.loseNote'), { exact: false })).toBeInTheDocument();
    });

    it('cancelar a troca não muda o plano', async () => {
        const { person, server: calls } = renderApp('/planos', { user: userOn('FREE'), api: server('FREE') });

        await person.click(await screen.findByRole('button', { name: t('plans.switchTo', { plan: 'Plus' }) }));
        await person.click(inDialog().getByRole('button', { name: t('app.cancel') }));

        expect(calls.to('PATCH /users/me/plan')).toHaveLength(0);
    });

    it('erro da API ao trocar: avisa e mantém o plano', async () => {
        const { person } = renderApp('/planos', { user: userOn('FREE'), api: { 'PATCH /users/me/plan': fail(500, 'INTERNAL_ERROR') } });

        await person.click(await screen.findByRole('button', { name: t('plans.switchTo', { plan: 'Plus' }) }));
        await person.click(inDialog().getByRole('button', { name: t('plans.dialog.confirm') }));

        expect(await screen.findByRole('alert')).toHaveTextContent(t('api.server'));
        const free = screen.getByRole('region', { name: t('plans.planAria', { plan: 'Free' }) });
        expect(within(free).getByRole('button', { name: t('plans.current') })).toBeDisabled();
    });
});
