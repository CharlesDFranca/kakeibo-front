import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import { PlansPage } from '@/features/plans/PlansPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { GoalDetailPage } from '@/features/goals/GoalDetailPage';
import { GoalsPage } from '@/features/goals/GoalsPage';
import { TransfersPage } from '@/features/transfers/TransfersPage';
import { TransactionsPage } from '@/features/transactions/TransactionsPage';
import { WalletsPage } from '@/features/wallets/WalletsPage';
import { AppShell } from '@/shared/layout/AppShell';
import { GuestRoute, ProtectedRoute } from './guards';

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/carteiras" element={<WalletsPage />} />
                    <Route path="/transacoes" element={<TransactionsPage />} />
                    <Route path="/transferencias" element={<TransfersPage />} />
                    <Route path="/metas" element={<GoalsPage />} />
                    <Route path="/metas/:id" element={<GoalDetailPage />} />
                    <Route path="/notificacoes" element={<NotificationsPage />} />
                    <Route path="/perfil" element={<ProfilePage />} />
                    <Route path="/planos" element={<PlansPage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
