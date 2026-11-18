import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { FullPageLoader } from '@/shared/ui/FullPageLoader';

/** Só deixa passar quem está logado. */
export function ProtectedRoute() {
    const { status } = useAuth();
    if (status === 'loading') return <FullPageLoader />;
    return status === 'authenticated' ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Telas de login/cadastro: quem já está logado vai para o início. */
export function GuestRoute() {
    const { status } = useAuth();
    if (status === 'loading') return <FullPageLoader />;
    return status === 'authenticated' ? <Navigate to="/" replace /> : <Outlet />;
}
