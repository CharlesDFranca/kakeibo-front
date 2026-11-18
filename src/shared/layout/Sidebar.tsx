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
import styles from './Sidebar.module.css';

type Item = { label: string; icon: ReactNode; to?: string };

/** Itens sem `to` ainda não têm tela: aparecem desativados. */
const ITEMS: Item[] = [
    { label: 'Painel', icon: <HomeIcon />, to: '/' },
    { label: 'Carteiras', icon: <WalletIcon />, to: '/carteiras' },
    { label: 'Transações', icon: <ListIcon />, to: '/transacoes' },
    { label: 'Transferências', icon: <SwapIcon />, to: '/transferencias' },
    { label: 'Metas', icon: <TargetIcon />, to: '/metas' },
    { label: 'Notificações', icon: <BellIcon />, to: '/notificacoes' },
    { label: 'Planos', icon: <StarIcon />, to: '/planos' },
    { label: 'Perfil', icon: <UserIcon />, to: '/perfil' },
];

export function Sidebar() {
    const { logout } = useAuth();

    return (
        <div className={styles.rail}>
        <nav className={styles.sidebar} aria-label="Navegação principal">
            <div className={styles.brandRow} aria-hidden="true">
                <span className={styles.brand}>K</span>
                <span className={styles.brandName}>Kakeibo</span>
            </div>

            <ul className={styles.list}>
                {ITEMS.map((item) => (
                    <li key={item.label}>
                        {item.to ? (
                            <NavLink
                                to={item.to}
                                end={item.to === '/'}
                                aria-label={item.label}
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
                                aria-label={`${item.label} (em breve)`}
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
                aria-label="Sair"
            >
                <LogoutIcon />
                <span className={styles.label}>Sair</span>
            </button>
        </nav>
        </div>
    );
}
