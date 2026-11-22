import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
    BellIcon,
    HomeIcon,
    ListIcon,
    LogoutIcon,
    StarIcon,
    UserIcon,
    SwapIcon,
    TargetIcon,
    WalletIcon,
} from '../ui/icons';
import { t } from '@/shared/i18n';
import styles from './Sidebar.module.css';

type Item = { label: string; icon: ReactNode; to?: string };

/** Itens sem `to` ainda não têm tela: aparecem desativados. */
const items = (): Item[] => [
    { label: t('layout.nav.dashboard'), icon: <HomeIcon />, to: '/' },
    { label: t('layout.nav.wallets'), icon: <WalletIcon />, to: '/carteiras' },
    { label: t('layout.nav.transactions'), icon: <ListIcon />, to: '/transacoes' },
    { label: t('layout.nav.transfers'), icon: <SwapIcon />, to: '/transferencias' },
    { label: t('layout.nav.goals'), icon: <TargetIcon />, to: '/metas' },
    { label: t('layout.nav.notifications'), icon: <BellIcon />, to: '/notificacoes' },
    { label: t('layout.nav.plans'), icon: <StarIcon />, to: '/planos' },
    { label: t('layout.nav.profile'), icon: <UserIcon />, to: '/perfil' },
];

export function Sidebar() {
    const { logout } = useAuth();

    return (
        <div className={styles.rail}>
        <nav className={styles.sidebar} aria-label={t('layout.sidebar.aria')} data-tour="sidebar">
            <div className={styles.brandRow} aria-hidden="true">
                <span className={styles.brand}>K</span>
                <span className={styles.brandName}>Kakeibo</span>
            </div>

            <ul className={styles.list}>
                {items().map((item) => (
                    <li key={item.label}>
                        {item.to ? (
                            <NavLink
                                to={item.to}
                                end={item.to === '/'}
                                aria-label={item.label}
                                data-tour={`nav${item.to}`}
                                className={({ isActive }: { isActive: boolean }) =>
                                    `${styles.item} ${isActive ? styles.active : ''}`
                                }
                            >
                                {item.icon}
                                <span className={styles.label}>{item.label}</span>
                            </NavLink>
                        ) : (
                            <button
                                type="button"
                                className={`${styles.item} ${styles.disabled}`}
                                aria-label={t('layout.sidebar.soon', { label: item.label })}
                                disabled
                            >
                                {item.icon}
                                <span className={styles.label}>{item.label}</span>
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            <button
                type="button"
                className={`${styles.item} ${styles.logout}`}
                onClick={() => void logout()}
                aria-label={t('layout.sidebar.logout')}
                data-tour="nav-logout"
            >
                <LogoutIcon />
                <span className={styles.label}>{t('layout.sidebar.logout')}</span>
            </button>
        </nav>
        </div>
    );
}
