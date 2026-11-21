import { AreaChart } from '@/shared/ui/charts/AreaChart';
import { t } from '@/shared/i18n';
import { formatCurrency, formatDate } from '@/shared/format/format';
import type { FinanceDashboard } from '../api/dashboard.api';
import { Card } from './Card';
import styles from './OverviewCard.module.css';

export function OverviewCard({ data }: { data: FinanceDashboard }) {
    const points = data.financialEvolution.map((p) => ({
        label: formatDate(p.date),
        value: Number(p.balance),
    }));

    return (
        <Card title={t('dashboard.evolution.title')} tone="brand" tour="evolution">
            {points.length > 0 ? (
                <div className={styles.chart}>
                    <AreaChart data={points} format={formatCurrency} height={210} />
                </div>
            ) : (
                <p className={styles.empty}>{t('dashboard.evolution.empty')}</p>
            )}

            <dl className={styles.stats} data-tour="balance-stats">
                <div>
                    <dt>{t('dashboard.income')}</dt>
                    <dd>{formatCurrency(data.balance.income)}</dd>
                </div>
                <div className={styles.main}>
                    <dt>{t('dashboard.currentBalance')}</dt>
                    <dd>{formatCurrency(data.balance.current)}</dd>
                </div>
                <div>
                    <dt>{t('dashboard.expenses')}</dt>
                    <dd>{formatCurrency(data.balance.expenses)}</dd>
                </div>
            </dl>
        </Card>
    );
}
