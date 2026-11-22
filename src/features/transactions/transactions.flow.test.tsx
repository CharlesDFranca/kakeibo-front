import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { categoryLabel, descriptionLabel, t } from '@/shared/i18n';
import { fail, noContent, ok, type Call } from '@/test/api-mock';
import { categories, userOn, wallets } from '@/test/fixtures';
import { inDialog, renderApp } from '@/test/render';
import { brl } from '@/test/text';

const today = new Date().toISOString();
const last = (calls: Call[]) => calls[calls.length - 1]!;
const items = [
    { id: 't1', description: 'Mercado', amount: '120.50', date: today, type: 'EXPENSE', category: categories[0]!, wallet: wallets.conta },
    { id: 't2', description: 'Salário', amount: '3000.00', date: today, type: 'INCOME', category: { id: 'c-sal', name: 'Salário' }, wallet: wallets.conta },
    { id: 't3', description: 'Transferência', amount: '200.00', date: today, type: 'TRANSFER', category: { id: 'c-tr', name: 'Transfer' }, wallet: wallets.conta },
];
const api = () => ({
    'GET /wallets': ok([wallets.conta, wallets.poupanca]),
    'GET /categories': ok(categories),
    'GET /transactions': ok(items),
});
const user = userOn('FREE');

async function openForm(person: ReturnType<typeof renderApp>['person']) {
    await screen.findByText('Mercado');
    await person.click(screen.getByRole('button', { name: t('transactions.new') }));
    return inDialog();
}

describe('transações: lista e filtros', () => {
    it('mostra as transações com sinal e o resumo só de receitas e despesas', async () => {
        renderApp('/transacoes', { user, api: api() });

        expect(await screen.findByText('Mercado')).toBeInTheDocument();
        expect(screen.getByText(`-${brl('120.50')}`)).toBeInTheDocument();
        expect(screen.getByText(`+${brl('3000.00')}`)).toBeInTheDocument();
        // a transferência aparece, mas não entra nos totais: resultado = 3000 - 120,50
        expect(screen.getByText('Transferência', { selector: 'strong' })).toBeInTheDocument();
        expect(screen.getByText(brl(3000 - 120.5))).toBeInTheDocument();
    });

    it('só receitas e despesas têm botão de excluir', async () => {
        renderApp('/transacoes', { user, api: api() });
        await screen.findByText('Mercado');

        expect(screen.getByRole('button', { name: t('transactions.deleteNamed', { name: 'Mercado' }) })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: t('transactions.deleteNamed', { name: descriptionLabel('Transferência') }) })).not.toBeInTheDocument();
    });

    it('pede ao servidor a lista do período (mês atual por padrão) e refaz o pedido a cada filtro', async () => {
        const { person, server } = renderApp('/transacoes', { user, api: api() });
        await screen.findByText('Mercado');

        const first = (server.to('GET /transactions')[0] as Call).query;
        expect(first.get('startDate')).toMatch(/^\d{4}-\d{2}-01$/);
        expect(first.get('endDate')).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        await person.selectOptions(screen.getByLabelText(t('transactions.filters.type')), 'EXPENSE');
        await person.selectOptions(screen.getByLabelText(t('transactions.filters.wallet')), wallets.conta.id);
        await person.selectOptions(screen.getByLabelText(t('transactions.filters.category')), 'c-food');

        await waitFor(() => {
            const q = last(server.to('GET /transactions')).query;
            expect(q.get('type')).toBe('EXPENSE');
            expect(q.get('walletIds')).toBe(wallets.conta.id);
            expect(q.get('categoryIds')).toBe('c-food');
        });
    });

    it('"todo o período" tira as datas do pedido', async () => {
        const { person, server } = renderApp('/transacoes', { user, api: api() });
        await screen.findByText('Mercado');

        await person.selectOptions(screen.getByLabelText(t('transactions.filters.period')), 'all');

        await waitFor(() => {
            const q = last(server.to('GET /transactions')).query;
            expect(q.has('startDate')).toBe(false);
        });
    });

    it('as categorias aparecem traduzidas no filtro', async () => {
        // a API manda o nome em inglês; a tela mostra no idioma atual
        renderApp('/transacoes', { user, api: { ...api(), 'GET /categories': ok([{ id: 'c-food', name: 'Food' }]) } });
        await screen.findByText('Mercado');

        expect(await screen.findByRole('option', { name: categoryLabel('Food') })).toBeInTheDocument();
        expect(categoryLabel('Food')).toBe('Alimentação');
    });
});

describe('transações: registrar', () => {
    it('campos vazios mostram os erros e não chamam a API', async () => {
        const { person, server } = renderApp('/transacoes', { user, api: api() });
        const dialog = await openForm(person);

        await person.click(dialog.getByRole('button', { name: t('transactions.form.submit') }));

        expect(await screen.findByText(t('transactions.form.error.amount'))).toBeInTheDocument();
        expect(screen.getByText(t('transactions.form.error.wallet'))).toBeInTheDocument();
        expect(screen.getByText(t('transactions.form.error.category'))).toBeInTheDocument();
        expect(server.to('POST /transactions')).toHaveLength(0);
    });

    it('não aceita data no futuro', async () => {
        const { person, server } = renderApp('/transacoes', { user, api: api() });
        const dialog = await openForm(person);

        await person.type(dialog.getByLabelText(t('transactions.form.amount')), '10');
        await person.selectOptions(dialog.getByLabelText(t('transactions.form.wallet')), wallets.conta.id);
        await person.selectOptions(dialog.getByLabelText(t('transactions.form.category')), 'c-food');
        fireEvent.change(dialog.getByLabelText(t('transactions.form.date')), { target: { value: '2999-01-01' } });
        await person.click(dialog.getByRole('button', { name: t('transactions.form.submit') }));

        expect(await screen.findByText(t('transactions.form.error.dateFuture'))).toBeInTheDocument();
        expect(server.to('POST /transactions')).toHaveLength(0);
    });

    it('registra uma despesa com o valor convertido e atualiza a lista e os saldos', async () => {
        const { person, server } = renderApp('/transacoes', { user, api: { ...api(), 'POST /transactions': ok({ id: 'novo' }) } });
        const dialog = await openForm(person);

        await person.type(dialog.getByLabelText(t('transactions.form.amount')), '49,90');
        await person.type(dialog.getByLabelText(t('transactions.form.description')), '  Cinema ');
        await person.selectOptions(dialog.getByLabelText(t('transactions.form.wallet')), wallets.conta.id);
        await person.selectOptions(dialog.getByLabelText(t('transactions.form.category')), 'c-food');
        await person.click(dialog.getByRole('button', { name: t('transactions.form.submit') }));

        expect(await screen.findByText(t('transactions.toast.created'))).toBeInTheDocument();
        const [call] = server.to('POST /transactions') as [Call];
        expect(call.body).toMatchObject({ amount: '49.90', description: 'Cinema', type: 'EXPENSE', categoryId: 'c-food', walletId: wallets.conta.id });
        expect(new Date((call.body as { date: string }).date).getTime()).toBeLessThanOrEqual(Date.now()); // a API recusa datas futuras
        expect(server.to('GET /transactions').length).toBeGreaterThan(1); // lista recarregada
        expect(server.to('GET /wallets').length).toBeGreaterThan(1); // saldos recarregados
    });

    it('alterna para receita', async () => {
        const { person, server } = renderApp('/transacoes', { user, api: { ...api(), 'POST /transactions': ok({ id: 'novo' }) } });
        const dialog = await openForm(person);

        await person.click(dialog.getByRole('button', { name: t('transactions.type.INCOME') }));
        await person.type(dialog.getByLabelText(t('transactions.form.amount')), '1000');
        await person.selectOptions(dialog.getByLabelText(t('transactions.form.wallet')), wallets.conta.id);
        await person.selectOptions(dialog.getByLabelText(t('transactions.form.category')), 'c-food');
        await person.click(dialog.getByRole('button', { name: t('transactions.form.submit') }));

        await screen.findByText(t('transactions.toast.created'));
        expect((server.to('POST /transactions')[0] as Call).body).toMatchObject({ type: 'INCOME', amount: '1000.00' });
    });

    it('erro da API no cadastro fica dentro do formulário, que continua aberto', async () => {
        const { person } = renderApp('/transacoes', { user, api: { ...api(), 'POST /transactions': fail(500, 'INTERNAL_ERROR') } });
        const dialog = await openForm(person);

        await person.type(dialog.getByLabelText(t('transactions.form.amount')), '10');
        await person.selectOptions(dialog.getByLabelText(t('transactions.form.wallet')), wallets.conta.id);
        await person.selectOptions(dialog.getByLabelText(t('transactions.form.category')), 'c-food');
        await person.click(dialog.getByRole('button', { name: t('transactions.form.submit') }));

        expect(await dialog.findByText(t('api.server'))).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('cria uma categoria nova sem sair do formulário e já a seleciona', async () => {
        const list = [...categories];
        const { person, server } = renderApp('/transacoes', {
            user,
            api: {
                ...api(),
                'GET /categories': () => ok(list),
                'POST /categories': () => {
                    list.push({ id: 'c-pets', name: 'Pets' });
                    return ok({ id: 'c-pets' });
                },
            },
        });
        const dialog = await openForm(person);

        await person.click(dialog.getByRole('button', { name: t('transactions.form.newCategoryLink') }));
        await person.type(dialog.getByLabelText(t('transactions.form.newCategory')), 'Pets');
        await person.click(dialog.getByRole('button', { name: t('transactions.form.createCategory') }));

        expect((server.to('POST /categories')[0] as Call).body).toEqual({ name: 'Pets' });
        const select = await dialog.findByLabelText(t('transactions.form.category'));
        await waitFor(() => expect(select).toHaveValue('c-pets'));
    });

    it('sem carteira, avisa e leva a criar uma', async () => {
        const { person } = renderApp('/transacoes', { user, api: { ...api(), 'GET /wallets': ok([]) } });
        await screen.findByText('Mercado');

        await person.click(screen.getByRole('button', { name: t('transactions.new') }));

        expect(inDialog().getByText(t('transactions.form.noWallet'))).toBeInTheDocument();
        expect(inDialog().getByRole('link', { name: t('transactions.form.createWallet') })).toHaveAttribute('href', '/carteiras');
    });
});

describe('transações: excluir', () => {
    it('exclui depois de confirmar e recarrega lista e saldos', async () => {
        const { person, server } = renderApp('/transacoes', { user, api: { ...api(), 'DELETE /transactions/t1': noContent() } });
        await screen.findByText('Mercado');

        await person.click(screen.getByRole('button', { name: t('transactions.deleteNamed', { name: 'Mercado' }) }));
        await person.click(inDialog().getByRole('button', { name: t('transactions.delete') }));

        expect(await screen.findByText(t('transactions.toast.deleted'))).toBeInTheDocument();
        expect(server.to('DELETE /transactions/t1')).toHaveLength(1);
        expect(server.to('GET /transactions').length).toBeGreaterThan(1);
    });
});
