import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { t } from '@/shared/i18n';
import { fail, ok, type Call } from '@/test/api-mock';
import { userOn, wallets } from '@/test/fixtures';
import { inDialog, renderApp } from '@/test/render';
import { brl } from '@/test/text';

const transfer = (id: string, status: 'COMPLETED' | 'REVERTED', amount = '200.00') => ({
    id,
    amount,
    status,
    sourceWallet: { id: wallets.conta.id, name: wallets.conta.name },
    destinationWallet: { id: wallets.poupanca.id, name: wallets.poupanca.name },
    createdAt: '2025-03-10T15:00:00.000Z',
    updatedAt: '2025-03-10T15:00:00.000Z',
});
const api = () => ({
    'GET /wallets': ok([wallets.conta, wallets.poupanca]),
    'GET /transfers': ok([transfer('tr1', 'COMPLETED'), transfer('tr2', 'REVERTED', '50.00')]),
});
const plus = userOn('PLUS');
const route = `${wallets.conta.name} → ${wallets.poupanca.name}`;

describe('transferências: plano', () => {
    it('no plano Free mostra o bloqueio e não chama a API', async () => {
        const { server } = renderApp('/transferencias', { user: userOn('FREE'), api: api() });

        expect(await screen.findByText(t('transfers.locked.feature'))).toBeInTheDocument();
        expect(server.to('GET /transfers')).toHaveLength(0);
        expect(screen.queryByRole('button', { name: t('transfers.new') })).not.toBeInTheDocument();
    });

    it.each(['PLUS', 'PRO'] as const)('no plano %s a tela funciona', async (plan) => {
        renderApp('/transferencias', { user: userOn(plan), api: api() });

        expect(await screen.findByRole('button', { name: t('transfers.new') })).toBeInTheDocument();
    });
});

describe('transferências: lista', () => {
    it('mostra origem → destino, valor e situação; só as concluídas têm botão de reverter', async () => {
        renderApp('/transferencias', { user: plus, api: api() });

        expect((await screen.findAllByText(route)).length).toBe(2);
        expect(screen.getByText(brl('200.00'))).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: t('transfers.revert.aria', { source: wallets.conta.name, destination: wallets.poupanca.name }) })).toHaveLength(1);
    });

    it('o filtro pede ao servidor só as transferências daquela situação', async () => {
        const { person, server } = renderApp('/transferencias', { user: plus, api: api() });
        await screen.findAllByText(route);

        await person.click(screen.getByRole('button', { name: t('transfers.filter.reverted') }));

        await waitFor(() => expect(server.to('GET /transfers').some((c) => c.query.get('status') === 'REVERTED')).toBe(true));
    });

    it('lista vazia convida a fazer a primeira', async () => {
        renderApp('/transferencias', { user: plus, api: { ...api(), 'GET /transfers': ok([]) } });

        expect(await screen.findByText(t('transfers.empty.title'))).toBeInTheDocument();
    });
});

describe('transferências: criar', () => {
    async function openForm(person: ReturnType<typeof renderApp>['person']) {
        await screen.findAllByText(route);
        await person.click(screen.getByRole('button', { name: t('transfers.new') }));
        return inDialog();
    }

    it('exige origem, destino e valor', async () => {
        const { person, server } = renderApp('/transferencias', { user: plus, api: api() });
        const dialog = await openForm(person);

        await person.click(dialog.getByRole('button', { name: t('transfers.form.submit') }));

        expect(await screen.findByText(t('transfers.error.source'))).toBeInTheDocument();
        expect(screen.getByText(t('transfers.error.destination'))).toBeInTheDocument();
        expect(screen.getByText(t('transfers.error.amount'))).toBeInTheDocument();
        expect(server.to('POST /transfers')).toHaveLength(0);
    });

    it('a origem não aparece como opção de destino', async () => {
        const { person } = renderApp('/transferencias', { user: plus, api: api() });
        const dialog = await openForm(person);

        await person.selectOptions(dialog.getByLabelText(t('transfers.form.source')), wallets.conta.id);

        const destination = dialog.getByLabelText(t('transfers.form.destination'));
        const values = Array.from((destination as HTMLSelectElement).options).map((o) => o.value);
        expect(values).not.toContain(wallets.conta.id);
        expect(values).toContain(wallets.poupanca.id);
    });

    it('recusa valor acima do saldo da origem, sem chamar a API', async () => {
        const { person, server } = renderApp('/transferencias', { user: plus, api: api() });
        const dialog = await openForm(person);

        await person.selectOptions(dialog.getByLabelText(t('transfers.form.source')), wallets.poupanca.id); // saldo 300
        await person.selectOptions(dialog.getByLabelText(t('transfers.form.destination')), wallets.conta.id);
        await person.type(dialog.getByLabelText(t('transfers.form.amount')), '500');
        await person.click(dialog.getByRole('button', { name: t('transfers.form.submit') }));

        expect(await screen.findByText(t('transfers.error.insufficient', { amount: brl('300.00') }))).toBeInTheDocument();
        expect(server.to('POST /transfers')).toHaveLength(0);
    });

    it('cria a transferência, avisa e recarrega a lista e os saldos', async () => {
        const { person, server } = renderApp('/transferencias', { user: plus, api: { ...api(), 'POST /transfers': ok({ id: 'novo' }) } });
        const dialog = await openForm(person);

        await person.selectOptions(dialog.getByLabelText(t('transfers.form.source')), wallets.conta.id);
        await person.selectOptions(dialog.getByLabelText(t('transfers.form.destination')), wallets.poupanca.id);
        await person.type(dialog.getByLabelText(t('transfers.form.amount')), '200,50');
        await person.click(dialog.getByRole('button', { name: t('transfers.form.submit') }));

        expect(await screen.findByText(t('transfers.toast.done'))).toBeInTheDocument();
        expect((server.to('POST /transfers')[0] as Call).body).toEqual({ amount: '200.50', sourceWalletId: wallets.conta.id, destinationWalletId: wallets.poupanca.id });
        expect(server.to('GET /transfers').length).toBeGreaterThan(1);
        expect(server.to('GET /wallets').length).toBeGreaterThan(1);
    });

    it('com menos de duas carteiras, avisa e leva a criar outra', async () => {
        const { person } = renderApp('/transferencias', { user: plus, api: { ...api(), 'GET /wallets': ok([wallets.conta]) } });
        await screen.findAllByText(route);

        await person.click(screen.getByRole('button', { name: t('transfers.new') }));

        expect(inDialog().getByText(t('transfers.form.needTwo'))).toBeInTheDocument();
    });
});

describe('transferências: reverter', () => {
    const revertButton = () =>
        screen.getByRole('button', { name: t('transfers.revert.aria', { source: wallets.conta.name, destination: wallets.poupanca.name }) });

    it('reverte depois de confirmar', async () => {
        const { person, server } = renderApp('/transferencias', { user: plus, api: { ...api(), 'POST /transfers/tr1/revert': ok(undefined) } });
        await screen.findAllByText(route);

        await person.click(revertButton());
        expect(server.to('POST /transfers/tr1/revert')).toHaveLength(0); // falta confirmar
        await person.click(inDialog().getByRole('button', { name: t('transfers.revert') }));

        expect(await screen.findByText(t('transfers.toast.reverted'))).toBeInTheDocument();
        expect(server.to('POST /transfers/tr1/revert')).toHaveLength(1);
    });

    it('se a API recusar (ex.: erro no servidor), mostra o aviso traduzido', async () => {
        const { person } = renderApp('/transferencias', { user: plus, api: { ...api(), 'POST /transfers/tr1/revert': fail(500, 'INTERNAL_ERROR') } });
        await screen.findAllByText(route);

        await person.click(revertButton());
        await person.click(inDialog().getByRole('button', { name: t('transfers.revert') }));

        expect(await screen.findByRole('alert')).toHaveTextContent(t('api.server'));
    });
});
