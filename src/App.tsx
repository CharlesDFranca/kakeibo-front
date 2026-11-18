import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { ToastProvider } from '@/shared/ui';
import { ThemeProvider } from '@/theme/ThemeProvider';

export function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <ToastProvider>
                        <AppRoutes />
                    </ToastProvider>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}
