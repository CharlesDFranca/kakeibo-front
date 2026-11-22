import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { CurrentUser } from '@/features/auth/api/auth.api';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { I18nProvider } from '@/shared/i18n';
import { ToastProvider } from '@/shared/ui';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { fail, mockApi, ok, type MockApi, type Reply } from './api-mock';

type Options = {
    /** Usuário logado; `null` simula quem não tem sessão (GET /users/me → 401). */
    user: CurrentUser | null;
    /** Rotas da API além de `GET /users/me`: `{ 'GET /wallets': ok([...]) }`. */
    api?: Record<string, Reply | ((call: never) => Reply | Promise<Reply>)>;
};

/**
 * Renderiza o app inteiro na rota pedida, com os mesmos providers do `App.tsx` (só o roteador muda:
 * MemoryRouter no lugar do BrowserRouter) e a API simulada.
 */
export function renderApp(route: string, { user, api = {} }: Options) {
    const server: MockApi = mockApi({
        'GET /users/me': user ? ok(user) : fail(401, 'UNAUTHORIZED'),
        ...(api as Parameters<typeof mockApi>[0]),
    });
    const person = userEvent.setup();

    const view = render(
        <ThemeProvider>
            <MemoryRouter initialEntries={[route]}>
                <AuthProvider>
                    <ToastProvider>
                        <I18nProvider>
                            <AppRoutes />
                        </I18nProvider>
                    </ToastProvider>
                </AuthProvider>
            </MemoryRouter>
        </ThemeProvider>,
    );

    return { ...view, server, person };
}

/** Consultas dentro do modal aberto (vários botões e campos têm o mesmo nome na página e no modal). */
export const inDialog = () => within(screen.getByRole('dialog'));
