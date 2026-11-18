import type { ReactNode } from 'react';
import styles from './Alert.module.css';

export function Alert({
    tone,
    children,
}: {
    tone: 'danger' | 'success';
    children: ReactNode;
}) {
    return (
        <div className={`${styles.alert} ${styles[tone]}`} role={tone === 'danger' ? 'alert' : 'status'}>
            {children}
        </div>
    );
}
