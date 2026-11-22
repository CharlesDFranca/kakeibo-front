import { TutorialOutlet, TutorialProvider } from '@/features/tutorial';
import { Sidebar } from './Sidebar';
import styles from './AppShell.module.css';

/** Estrutura das telas autenticadas: sidebar fixa + conteúdo. */
export function AppShell() {
    return (
        <TutorialProvider>
            <div className={styles.shell}>
                <Sidebar />
                <div className={styles.content}>
                    <TutorialOutlet />
                </div>
            </div>
        </TutorialProvider>
    );
}
