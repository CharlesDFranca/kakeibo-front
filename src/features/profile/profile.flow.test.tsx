import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MESSAGES } from '@/shared/i18n/messages';
import { t } from '@/shared/i18n';
import { noContent, ok } from '@/test/api-mock';
import { userOn } from '@/test/fixtures';
import { renderApp } from '@/test/render';

describe('perfil', () => {
    it('mostra nome, usuário e plano', async () => {
        renderApp('/perfil', { user: userOn('PLUS') });

        expect(await screen.findByRole('heading', { name: 'Ana Souza' })).toBeInTheDocument();
        expect(screen.getByText('@ana')).toBeInTheDocument();
        expect(screen.getByText(t('profile.planBadge', { plan: 'Plus' }))).toBeInTheDocument();
    });

    it('só quem não tem o plano mais alto vê o convite para mudar de plano', async () => {
        const { unmount } = renderApp('/perfil', { user: userOn('FREE') });
        expect(await screen.findByRole('link', { name: t('profile.features.upgrade') })).toHaveAttribute('href', '/planos');
        unmount();

        renderApp('/perfil', { user: userOn('PRO') });
        await screen.findByRole('heading', { name: 'Ana Souza' });
        expect(screen.queryByRole('link', { name: t('profile.features.upgrade') })).not.toBeInTheDocument();
    });

    it('troca o tema e guarda a escolha no navegador', async () => {
        const { person } = renderApp('/perfil', { user: userOn('FREE') });

        await person.click(await screen.findByRole('radio', { name: 'Vinho' }));

        expect(screen.getByRole('radio', { name: 'Vinho' })).toBeChecked();
        expect(localStorage.getItem('kakeibo:theme')).toBe('vinho');
    });

    it('o tema de alto contraste está entre as opções', async () => {
        renderApp('/perfil', { user: userOn('FREE') });

        expect(await screen.findByRole('radio', { name: t('profile.theme.highContrast') })).toBeInTheDocument();
    });

    it('troca o idioma: a tela passa para o inglês e a escolha é guardada', async () => {
        const { person } = renderApp('/perfil', { user: userOn('FREE') });

        await person.click(await screen.findByRole('radio', { name: 'English' }));

        expect(await screen.findByRole('heading', { name: MESSAGES.en['profile.title'] })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
        expect(localStorage.getItem('kakeibo:locale')).toBe('en');
        expect(screen.queryByRole('heading', { name: MESSAGES.pt['profile.title'] })).not.toBeInTheDocument();
    });

    it('a lista de tutoriais respeita o plano: Free tem 5, Pro tem 9', async () => {
        const replay = new RegExp(`^${t('profile.tutorials.replay')}`);
        const free = renderApp('/perfil', { user: userOn('FREE') });
        await screen.findByRole('heading', { name: 'Ana Souza' });
        expect(screen.getAllByRole('button', { name: replay })).toHaveLength(5);
        free.unmount();

        renderApp('/perfil', { user: userOn('PRO') });
        await screen.findByRole('heading', { name: 'Ana Souza' });
        expect(screen.getAllByRole('button', { name: replay })).toHaveLength(9);
    });

    it('marca como "novo" os tutoriais que o usuário ainda não viu', async () => {
        renderApp('/perfil', { user: userOn('FREE', { seenTutorials: ['dashboard', 'profile'] }) });
        await screen.findByRole('heading', { name: 'Ana Souza' });

        // Free tem 5 tutoriais; 2 já vistos (a tela do perfil abre o dela, mas aqui já consta como visto)
        expect(screen.getAllByText(t('profile.tutorials.new'))).toHaveLength(3);
    });

    it('"Recomeçar todos" zera os tutoriais no servidor e volta ao painel', async () => {
        const { person, server } = renderApp('/perfil', { user: userOn('FREE'), api: { 'DELETE /users/me/tutorials': ok({ seenTutorials: [] }) } });

        await person.click(await screen.findByRole('button', { name: new RegExp(t('profile.tutorials.resetAll')) }));

        expect(server.to('DELETE /users/me/tutorials')).toHaveLength(1);
        await waitFor(() => expect(screen.queryByRole('heading', { name: 'Ana Souza' })).not.toBeInTheDocument());
    });

    it('sair encerra a sessão e leva ao login', async () => {
        let loggedIn = true;
        const { person, server } = renderApp('/perfil', {
            user: userOn('FREE'),
            api: {
                'GET /users/me': () => ok(userOn('FREE')),
                'POST /auth/logout': () => {
                    loggedIn = false;
                    return noContent();
                },
            },
        });

        await person.click(await screen.findByRole('button', { name: new RegExp(t('profile.session.logout')) }));

        expect(await screen.findByRole('button', { name: t('auth.login.submit') })).toBeInTheDocument();
        expect(server.to('POST /auth/logout')).toHaveLength(1);
        expect(loggedIn).toBe(false);
    });
});
