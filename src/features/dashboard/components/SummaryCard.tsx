import type { ReactNode } from 'react';
import { Card } from './Card';
import styles from './SummaryCard.module.css';

type Props = {
    label: string;
    value: string;
    hint: string;
    icon: ReactNode;
    tone: 'brand' | 'accent';
};

/** Cartão de destaque (receitas / despesas), como os cartões coloridos da referência. */
export function SummaryCard({ label, value, hint, icon, tone }: Props) {
    return (
        <Card tone={tone}>
            <div className={styles.row}>
                <span className={styles.icon}>{icon}</span>
                <span className={styles.label}>{label}</span>
            </div>
            <strong className={styles.value}>{value}</strong>
            <span className={styles.hint}>{hint}</span>
        </Card>
    );
}
