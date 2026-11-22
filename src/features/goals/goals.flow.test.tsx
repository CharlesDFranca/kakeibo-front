import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatLocalDate } from '@/shared/format/format';
import { t } from '@/shared/i18n';
import { fail, noContent, ok, type Call } from '@/test/api-mock';
import { userOn, wallets } from '@/test/fixtures';
import { inDialog, renderApp } from '@/test/render';
import { brl, plain } from '@/test/text';

const future = new Date(Date.now() + 40 * 86_400_000).toISOString();
const goals = [
    { id: 'g1', name: 'Viagem ao Japão', status: 'IN PROGRESS', currentAmount: '500.00', targetAmount: '2000.00', deadline: future },
    { id: 'g2', name: 'Notebook novo', status: 'COMPLETED', currentAmount: '6500.00', targetAmount: '6500.00', deadline: future },
    { id: 'g3', name: 'Bicicleta', status: 'CANCELLED', currentAmount: '0.00', targetAmount: '4500.00', deadline: future },
    { id: 'g4', name: 'Reforma da cozinha', status: 'EXPIRED', currentAmount: '1200.00', targetAmount: '9000.00', deadline: '2024-01-01T00:00:00.000Z' },
];
const detail = (overrides = {}) => ({
    goalId: 'g1',
    name: 'Viagem ao Japão',
    status: 'IN PROGRESS',
    currentAmount: '500.00',
    targetAmount: '2000.00',
    deadline: future,
    movements: [{ id: 'm1', type: 'DEPOSIT', amount: '500.00', walletId: wallets.conta.id, revertedDepositId: null, reverted: false, createdAt: '2025-03-01T12:00:00.000Z' }],
    ...overrides,
});
const pro = userOn('PRO');

describe('metas: plano', () => {
    it.each(['FREE', 'PLUS'] as const)('no plano %s mostra o bloqueio e não chama a API', async (plan) => {
        const { server } = renderApp('/metas', { user: userOn(plan), api: { 'GET /goals': ok({ goals }) } });

        expect(await screen.findByText(t('goals.locked.feature'))).toBeInTheDocument();
        expect(server.to('GET /goals')).toHaveLength(0);
    });

    it('o detalhe também fica bloqueado fora do Pro', async () => {
        const { server } = renderApp('/metas/g1', { user: userOn('PLUS'), api: { 'GET /goals/g1': ok(detail()) } });

        expect(await screen.findByText(t('goals.locked.feature'))).toBeInTheDocument();
        expect(server.to('GET /goals/g1')).toHaveLength(0);
    });
});

describe('metas: lista', () => {
    it('mostra cada meta com situação, valores e link para o detalhe', async () => {
        renderApp('/metas', { user: pro, api: { 'GET /goals': ok({ goals }) } });

        const card = (await screen.findByText('Viagem ao Japão')).closest('a')!;
        expect(card).toHaveAttribute('href', '/metas/g1');
        expect(card).toHaveTextContent(plain(t('goals.card.amounts', { current: brl('500.00'), target: brl('2000.00') })));
        expect(card).toHaveTextContent('25%');
        expect(screen.getByText('Notebook novo')).toBeInTheDocument();
        expect(screen.getByText('Bicicleta')).toBeInTheDocument();
        expect(screen.getByText('Reforma da cozinha')).toBeInTheDocument();
    });

    it('o filtro mostra só as metas da situação escolhida', async () => {
        const { person } = renderApp('/metas', { user: pro, api: { 'GET /goals': ok({ goals }) } });
        await screen.findByText('Viagem ao Japão');

        await person.click(screen.getByRole('button', { name: t('goals.filter.completed') }));

        expect(screen.getByText('Notebook novo')).toBeInTheDocument();
        expect(screen.queryByText('Viagem ao Japão')).not.toBeInTheDocument();
        expect(screen.queryByText('Bicicleta')).not.toBeInTheDocument();
    });

    it('sem metas, convida a criar a primeira', async () => {
        renderApp('/metas', { user: pro, api: { 'GET /goals': ok({ goals: [] }) } });

        expect(await screen.findByText(t('goals.empty.title'))).toBeInTheDocument();
    });
});

describe('metas: detalhe e aporte', () => {
    const api = (extra = {}) => ({ 'GET /goals/g1': ok(detail()), 'GET /wallets': ok([wallets.conta, wallets.poupanca]), ...extra });

    async function openDeposit(person: ReturnType<typeof renderApp>['person']) {
        await screen.findByRole('button', { name: t('goals.detail.deposit') });
        await person.click(screen.getByRole('button', { name: t('goals.detail.deposit') }));
        return inDialog();
    }

    it('mostra o resumo, o prazo e o histórico de aportes', async () => {
        renderApp('/metas/g1', { user: pro, api: api() });

        expect(await screen.findByRole('heading', { name: 'Viagem ao Japão' })).toBeInTheDocument();
        expect(screen.getByText(plain(formatLocalDate(future)))).toBeInTheDocument();
        expect(screen.getByText(t('goals.movement.DEPOSIT'))).toBeInTheDocument();
        expect(screen.getByText(`+${brl('500.00')}`)).toBeInTheDocument();
    });

    it('meta concluída não aceita novos aportes', async () => {
        renderApp('/metas/g1', { user: pro, api: api({ 'GET /goals/g1': ok(detail({ status: 'COMPLETED', currentAmount: '2000.00' })) }) });

        await screen.findByRole('heading', { name: 'Viagem ao Japão' });
        expect(screen.queryByRole('button', { name: t('goals.detail.deposit') })).not.toBeInTheDocument();
    });

    it('meta expirada oferece reativar em vez de aportar', async () => {
        renderApp('/metas/g1', { user: pro, api: api({ 'GET /goals/g1': ok(detail({ status: 'EXPIRED' })) }) });

        expect(await screen.findByRole('button', { name: t('goals.detail.reactivate') })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: t('goals.detail.deposit') })).not.toBeInTheDocument();
    });

    it('meta cancelada não tem nenhuma ação', async () => {
        renderApp('/metas/g1', { user: pro, api: api({ 'GET /goals/g1': ok(detail({ status: 'CANCELLED' })) }) });

        await screen.findByRole('heading', { name: 'Viagem ao Japão' });
        for (const key of ['goals.detail.deposit', 'goals.detail.rename', 'goals.detail.cancel', 'goals.detail.reactivate'] as const) {
            expect(screen.queryByRole('button', { name: t(key) }), key).not.toBeInTheDocument();
        }
    });

    it('exige carteira e valor', async () => {
        const { person, server } = renderApp('/metas/g1', { user: pro, api: api() });
        const dialog = await openDeposit(person);

        await person.click(dialog.getByRole('button', { name: t('goals.deposit.submit') }));

        expect(await screen.findByText(t('goals.deposit.error.wallet'))).toBeInTheDocument();
        expect(screen.getByText(t('goals.deposit.error.amount'))).toBeInTheDocument();
        expect(server.to('POST /goals/g1/deposits')).toHaveLength(0);
    });

    it('recusa valor acima do que falta para a meta (1.500,00)', async () => {
        const { person, server } = renderApp('/metas/g1', { user: pro, api: api() });
        const dialog = await openDeposit(person);

        await person.selectOptions(dialog.getByLabelText(t('goals.deposit.wallet')), wallets.conta.id);
        await person.type(dialog.getByLabelText(t('goals.deposit.amount')), '1.600,00');
        await person.click(dialog.getByRole('button', { name: t('goals.deposit.submit') }));

        expect(await screen.findByText(t('goals.deposit.error.exceeds', { amount: brl('1500.00') }))).toBeInTheDocument();
        expect(server.to('POST /goals/g1/deposits')).toHaveLength(0);
    });

    it('recusa valor acima do saldo da carteira escolhida', async () => {
        const { person, server } = renderApp('/metas/g1', { user: pro, api: api() });
        const dialog = await openDeposit(person);

        await person.selectOptions(dialog.getByLabelText(t('goals.deposit.wallet')), wallets.poupanca.id); // saldo 300
        await person.type(dialog.getByLabelText(t('goals.deposit.amount')), '400');
        await person.click(dialog.getByRole('button', { name: t('goals.deposit.submit') }));

        expect(await screen.findByText(t('goals.deposit.error.insufficient', { amount: brl('300.00') }))).toBeInTheDocument();
        expect(server.to('POST /goals/g1/deposits')).toHaveLength(0);
    });

    it('faz o aporte, avisa e recarrega a meta e os saldos', async () => {
        const { person, server } = renderApp('/metas/g1', { user: pro, api: api({ 'POST /goals/g1/deposits': ok({ id: 'novo' }) }) });
        const dialog = await openDeposit(person);

        await person.selectOptions(dialog.getByLabelText(t('goals.deposit.wallet')), wallets.conta.id);
        await person.type(dialog.getByLabelText(t('goals.deposit.amount')), '100,00');
        await person.click(dialog.getByRole('button', { name: t('goals.deposit.submit') }));

        expect(await screen.findByText(t('goals.toast.deposited'))).toBeInTheDocument();
        expect((server.to('POST /goals/g1/deposits')[0] as Call).body).toEqual({ walletId: wallets.conta.id, amount: '100.00' });
        expect(server.to('GET /goals/g1').length).toBeGreaterThan(1);
        expect(server.to('GET /wallets').length).toBeGreaterThan(1);
    });

    it('estorna um aporte depois de confirmar', async () => {
        const { person, server } = renderApp('/metas/g1', { user: pro, api: api({ 'POST /goals/g1/deposits/m1/revert': ok({}) }) });
        await screen.findByText(t('goals.movement.DEPOSIT'));

        await person.click(screen.getByRole('button', { name: t('goals.movement.revert') }));
        expect(server.to('POST /goals/g1/deposits/m1/revert')).toHaveLength(0);
        await person.click(inDialog().getByRole('button', { name: t('goals.revertDialog.confirm') }));

        expect(await screen.findByText(t('goals.toast.depositReverted'))).toBeInTheDocument();
    });

    it('aporte já estornado não tem botão de estorno', async () => {
        const reverted = detail({ movements: [{ ...detail().movements[0]!, reverted: true }] });
        renderApp('/metas/g1', { user: pro, api: api({ 'GET /goals/g1': ok(reverted) }) });

        await screen.findByText(t('goals.movement.DEPOSIT'));
        expect(screen.queryByRole('button', { name: t('goals.movement.revert') })).not.toBeInTheDocument();
    });

    it('cancela a meta só depois de confirmar', async () => {
        const { person, server } = renderApp('/metas/g1', { user: pro, api: api({ 'DELETE /goals/g1': noContent() }) });
        await screen.findByRole('heading', { name: 'Viagem ao Japão' });

        await person.click(screen.getByRole('button', { name: t('goals.detail.cancel') }));
        expect(server.to('DELETE /goals/g1')).toHaveLength(0);
        await person.click(inDialog().getByRole('button', { name: t('goals.detail.cancel') }));

        expect(await screen.findByText(t('goals.toast.cancelled'))).toBeInTheDocument();
        expect(server.to('DELETE /goals/g1')).toHaveLength(1);
    });

    it('erro ao cancelar mostra o aviso e recarrega a meta (o estado pode ter mudado)', async () => {
        const { person, server } = renderApp('/metas/g1', { user: pro, api: api({ 'DELETE /goals/g1': fail(500, 'INTERNAL_ERROR') }) });
        await screen.findByRole('heading', { name: 'Viagem ao Japão' });
        const before = server.to('GET /goals/g1').length;

        await person.click(screen.getByRole('button', { name: t('goals.detail.cancel') }));
        await person.click(inDialog().getByRole('button', { name: t('goals.detail.cancel') }));

        expect(await screen.findByRole('alert')).toHaveTextContent(t('api.server'));
        await waitFor(() => expect(server.to('GET /goals/g1').length).toBeGreaterThan(before));
    });
});
