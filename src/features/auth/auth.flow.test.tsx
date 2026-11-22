import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { t } from '@/shared/i18n';
import { fail, noContent, ok, type Call } from '@/test/api-mock';
import { userOn } from '@/test/fixtures';
import { renderApp } from '@/test/render';

const submit = () => screen.findByRole('button', { name: t('auth.login.submit') });

describe('login e proteção de rotas', () => {
    it('quem não tem sessão é levado ao login ao abrir qualquer tela', async () => {
        renderApp('/carteiras', { user: null });

        expect(await submit()).toBeInTheDocument();
    });

    it('quem já está logado não vê o login: vai para o app', async () => {
        renderApp('/login', { user: userOn('FREE'), api: { 'GET /wallets': ok([]) } });

        await waitFor(() => expect(screen.queryByRole('button', { name: t('auth.login.submit') })).not.toBeInTheDocument());
    });

    it('campos vazios mostram os erros e não chamam a API', async () => {
        const { person, server } = renderApp('/login', { user: null });

        await person.click(await submit());

        expect(await screen.findByText(t('auth.validation.email'))).toBeInTheDocument();
        expect(screen.getByText(t('auth.validation.password'))).toBeInTheDocument();
        expect(server.to('POST /auth/login')).toHaveLength(0);
    });

    it('credenciais erradas mostram a mensagem traduzida pelo código do erro', async () => {
        const { person } = renderApp('/login', { user: null, api: { 'POST /auth/login': fail(401, 'INVALID_CREDENTIALS', 'Invalid credentials.') } });

        await person.type(await screen.findByLabelText(t('auth.login.email')), 'ana@example.com');
        await person.type(screen.getByLabelText(t('auth.login.password')), 'senha-errada');
        await person.click(screen.getByRole('button', { name: t('auth.login.submit') }));

        expect(await screen.findByRole('alert')).toHaveTextContent(t('error.INVALID_CREDENTIALS'));
    });

    it('login correto envia e-mail e senha, carrega o usuário e entra no app', async () => {
        let loggedIn = false;
        const { person, server } = renderApp('/login', {
            user: null,
            api: {
                'GET /users/me': () => (loggedIn ? ok(userOn('FREE')) : fail(401, 'UNAUTHORIZED')),
                'POST /auth/login': () => {
                    loggedIn = true;
                    return noContent();
                },
            },
        });

        await person.type(await screen.findByLabelText(t('auth.login.email')), '  ana@example.com ');
        await person.type(screen.getByLabelText(t('auth.login.password')), 'segredo123');
        await person.click(screen.getByRole('button', { name: t('auth.login.submit') }));

        await waitFor(() => expect(screen.queryByRole('button', { name: t('auth.login.submit') })).not.toBeInTheDocument());
        const [call] = server.to('POST /auth/login') as [Call];
        expect(call.body).toEqual({ email: 'ana@example.com', password: 'segredo123' });
    });

    it('a senha pode ser mostrada e escondida', async () => {
        const { person } = renderApp('/login', { user: null });
        const field = await screen.findByLabelText(t('auth.login.password'));
        expect(field).toHaveAttribute('type', 'password');

        await person.click(screen.getByRole('button', { name: t('app.password.showAria') }));

        expect(field).toHaveAttribute('type', 'text');
    });
});
