import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
    return (
        <div className={styles.empty}>
            <span className={styles.icon}>{icon}</span>
            <strong>{title}</strong>
            {children && <p>{children}</p>}
            {action}
        </div>
    );
}
