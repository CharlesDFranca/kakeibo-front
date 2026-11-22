import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { t } from '@/shared/i18n';
import { fail, noContent, ok, type Call } from '@/test/api-mock';
import { userOn, wallets } from '@/test/fixtures';
import { brl } from '@/test/text';
import { inDialog, renderApp } from '@/test/render';

const list = [wallets.conta, wallets.poupanca];
const user = userOn('FREE');

describe('carteiras', () => {
    it('lista as carteiras e soma o saldo total', async () => {
        renderApp('/carteiras', { user, api: { 'GET /wallets': ok(list) } });

        expect(await screen.findByText(wallets.conta.name)).toBeInTheDocument();
        expect(screen.getByText(wallets.poupanca.name)).toBeInTheDocument();
        expect(screen.getByText(brl('1500.00'))).toBeInTheDocument();
        expect(screen.getByText(brl('1800.00'))).toBeInTheDocument(); // total
    });

    it('sem carteiras, convida a criar a primeira', async () => {
        renderApp('/carteiras', { user, api: { 'GET /wallets': ok([]) } });

        expect(await screen.findByText(t('wallets.empty.title'))).toBeInTheDocument();
    });

    it('erro ao carregar mostra a mensagem e permite tentar de novo', async () => {
        const { person, server } = renderApp('/carteiras', { user, api: { 'GET /wallets': fail(500, 'INTERNAL_ERROR') } });

        expect(await screen.findByText(t('api.server'))).toBeInTheDocument();
        server.set('GET /wallets', ok(list));
        await person.click(screen.getByRole('button', { name: t('wallets.retry') }));

        expect(await screen.findByText(wallets.conta.name)).toBeInTheDocument();
    });

    it('cria uma carteira: converte o saldo digitado, avisa e recarrega a lista', async () => {
        const created = { id: 'w-nova', name: 'Reserva', balance: '1234.56' };
        const items = [...list];
        const { person, server } = renderApp('/carteiras', {
            user,
            api: {
                'GET /wallets': () => ok(items),
                'POST /wallets': () => {
                    items.push(created);
                    return ok({ id: created.id });
                },
            },
        });
        await screen.findByText(wallets.conta.name);

        await person.click(screen.getByRole('button', { name: t('wallets.new') }));
        await person.type(inDialog().getByLabelText(t('wallets.form.name')), 'Reserva');
        await person.type(inDialog().getByLabelText(t('wallets.form.balance')), '1.234,56');
        await person.click(inDialog().getByRole('button', { name: t('wallets.form.create') }));

        expect(await screen.findByText(t('wallets.toast.created'))).toBeInTheDocument();
        const [call] = server.to('POST /wallets') as [Call];
        expect(call.body).toEqual({ name: 'Reserva', balance: '1234.56' });
        expect(await screen.findByText('Reserva')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('nome vazio mostra o erro no campo e não chama a API', async () => {
        const { person, server } = renderApp('/carteiras', { user, api: { 'GET /wallets': ok(list) } });
        await screen.findByText(wallets.conta.name);

        await person.click(screen.getByRole('button', { name: t('wallets.new') }));
        await person.click(inDialog().getByRole('button', { name: t('wallets.form.create') }));

        expect(await screen.findByText(t('wallets.form.error.nameRequired'))).toBeInTheDocument();
        expect(server.to('POST /wallets')).toHaveLength(0);
    });

    it('saldo inicial inválido é recusado antes de ir à API', async () => {
        const { person, server } = renderApp('/carteiras', { user, api: { 'GET /wallets': ok(list) } });
        await screen.findByText(wallets.conta.name);

        await person.click(screen.getByRole('button', { name: t('wallets.new') }));
        await person.type(inDialog().getByLabelText(t('wallets.form.name')), 'X');
        await person.type(inDialog().getByLabelText(t('wallets.form.balance')), 'abc');
        await person.click(inDialog().getByRole('button', { name: t('wallets.form.create') }));

        expect(await screen.findByText(t('wallets.form.error.balanceInvalid'))).toBeInTheDocument();
        expect(server.to('POST /wallets')).toHaveLength(0);
    });

    it('renomeia uma carteira', async () => {
        const { person, server } = renderApp('/carteiras', { user, api: { 'GET /wallets': ok(list), 'PATCH /wallets/w-conta': ok({}) } });
        await screen.findByText(wallets.conta.name);

        await person.click(screen.getByRole('button', { name: t('wallets.renameNamed', { name: wallets.conta.name }) }));
        const field = inDialog().getByLabelText(t('wallets.form.name'));
        await person.clear(field);
        await person.type(field, 'Conta principal');
        await person.click(inDialog().getByRole('button', { name: t('wallets.form.save') }));

        expect(await screen.findByText(t('wallets.toast.renamed'))).toBeInTheDocument();
        expect((server.to('PATCH /wallets/w-conta')[0] as Call).body).toEqual({ name: 'Conta principal' });
    });

    it('exclui só depois de confirmar', async () => {
        const { person, server } = renderApp('/carteiras', { user, api: { 'GET /wallets': ok(list), 'DELETE /wallets/w-poup': noContent() } });
        await screen.findByText(wallets.poupanca.name);

        await person.click(screen.getByRole('button', { name: t('wallets.deleteNamed', { name: wallets.poupanca.name }) }));
        expect(server.to('DELETE /wallets/w-poup')).toHaveLength(0); // ainda não: falta confirmar
        await person.click(inDialog().getByRole('button', { name: t('wallets.delete') }));

        expect(await screen.findByText(t('wallets.toast.deleted'))).toBeInTheDocument();
        expect(server.to('DELETE /wallets/w-poup')).toHaveLength(1);
    });

    it('cancelar a exclusão não chama a API', async () => {
        const { person, server } = renderApp('/carteiras', { user, api: { 'GET /wallets': ok(list) } });
        await screen.findByText(wallets.poupanca.name);

        await person.click(screen.getByRole('button', { name: t('wallets.deleteNamed', { name: wallets.poupanca.name }) }));
        await person.click(inDialog().getByRole('button', { name: t('app.cancel') }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(server.to('DELETE /wallets/w-poup')).toHaveLength(0);
    });

    it('recusa da API ao excluir aparece como aviso traduzido e a carteira continua', async () => {
        const { person } = renderApp('/carteiras', { user, api: { 'GET /wallets': ok(list), 'DELETE /wallets/w-poup': fail(500, 'INTERNAL_ERROR') } });
        await screen.findByText(wallets.poupanca.name);

        await person.click(screen.getByRole('button', { name: t('wallets.deleteNamed', { name: wallets.poupanca.name }) }));
        await person.click(inDialog().getByRole('button', { name: t('wallets.delete') }));

        expect(await screen.findByRole('alert')).toHaveTextContent(t('api.server'));
        expect(screen.getByText(wallets.poupanca.name)).toBeInTheDocument();
    });
});
