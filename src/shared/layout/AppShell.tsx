import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import styles from './AppShell.module.css';

/** Estrutura das telas autenticadas: sidebar fixa + conteúdo. */
export function AppShell() {
    return (
        <div className={styles.shell}>
            <Sidebar />
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
}
