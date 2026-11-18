import type { ReactNode } from 'react';
import styles from './Card.module.css';

type Props = {
    title?: string;
    action?: ReactNode;
    tone?: 'surface' | 'brand' | 'accent';
    children: ReactNode;
    className?: string;
};

/** Cartão base do painel; o tom vem do tema (surface / brand / accent). */
export function Card({ title, action, tone = 'surface', children, className }: Props) {
    return (
        <section className={`${styles.card} ${styles[tone]} ${className ?? ''}`}>
            {(title || action) && (
                <header className={styles.header}>
                    {title && <h2 className={styles.title}>{title}</h2>}
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}
