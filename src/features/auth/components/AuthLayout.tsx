import type { ReactNode } from 'react';
import { Logo } from '@/shared/ui';
import { AuthShowcase } from './AuthShowcase';
import styles from './AuthLayout.module.css';

type Props = { title: string; subtitle: string; children: ReactNode; footer: ReactNode };

/** Moldura das telas de autenticação: vitrine à esquerda, formulário à direita. */
export function AuthLayout({ title, subtitle, children, footer }: Props) {
    return (
        <div className={styles.page}>
            <aside className={styles.showcase}>
                <AuthShowcase />
            </aside>

            <main className={styles.main}>
                <div className={styles.card}>
                    <div className={styles.logo}>
                        <Logo />
                    </div>
                    <header className={styles.header}>
                        <h1 className={styles.title}>{title}</h1>
                        <p className={styles.subtitle}>{subtitle}</p>
                    </header>
                    {children}
                    <footer className={styles.footer}>{footer}</footer>
                </div>
            </main>
        </div>
    );
}
