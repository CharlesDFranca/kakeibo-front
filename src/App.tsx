import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { I18nProvider } from '@/shared/i18n';
import { ToastProvider } from '@/shared/ui';
import { ThemeProvider } from '@/theme/ThemeProvider';

export function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <ToastProvider>
                        <I18nProvider>
                            <AppRoutes />
                        </I18nProvider>
                    </ToastProvider>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}
