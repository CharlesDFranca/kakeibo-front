import { categoryLabel, descriptionLabel, t } from '@/shared/i18n';
import { formatCurrency, formatDayMonth } from '@/shared/format/format';
import { ArrowDownIcon, ArrowUpIcon, SwapIcon } from '@/shared/ui/icons';
import type { FinanceDashboard, TransactionType } from '../api/dashboard.api';
import { Card } from './Card';
import styles from './RecentTransactions.module.css';

type Tx = FinanceDashboard['recentTransactions'][number];

const KIND: Record<TransactionType, 'income' | 'expense' | 'neutral'> = {
    INCOME: 'income',
    OPENING_BALANCE: 'income',
    EXPENSE: 'expense',
    TRANSFER: 'neutral',
    ADJUSTMENT: 'neutral',
};

const ICON = { income: <ArrowUpIcon size={16} />, expense: <ArrowDownIcon size={16} />, neutral: <SwapIcon size={16} /> };

function label(tx: Tx): string {
    return descriptionLabel(tx.description.trim()) || categoryLabel(tx.category.name);
}

export function RecentTransactions({ items }: { items: Tx[] }) {
    return (
        <Card title={t('dashboard.recent.title')} tour="recent">
            {items.length === 0 ? (
                <p className={styles.empty}>{t('dashboard.recent.empty')}</p>
            ) : (
                <ul className={styles.list}>
                    {items.map((tx) => {
                        const kind = KIND[tx.type];
                        const sign = kind === 'income' ? '+' : kind === 'expense' ? '-' : '';
                        return (
                            <li key={tx.id} className={styles.item}>
                                <span className={`${styles.icon} ${styles[kind]}`}>{ICON[kind]}</span>
                                <div className={styles.info}>
                                    <strong>{label(tx)}</strong>
                                    <span>
                                        {categoryLabel(tx.category.name)} · {tx.wallet.name} · {formatDayMonth(tx.date)}
                                    </span>
                                </div>
                                <span className={`${styles.amount} ${styles[`amount_${kind}`]}`}>
                                    {sign}
                                    {formatCurrency(tx.amount)}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Card>
    );
}
