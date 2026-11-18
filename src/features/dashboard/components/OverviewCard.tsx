import { AreaChart } from '@/shared/ui/charts/AreaChart';
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
        <Card title="Evolução do saldo" tone="brand">
            {points.length > 0 ? (
                <div className={styles.chart}>
                    <AreaChart data={points} format={formatCurrency} height={210} />
                </div>
            ) : (
                <p className={styles.empty}>Sem movimentações neste período.</p>
            )}

            <dl className={styles.stats}>
                <div>
                    <dt>Receitas</dt>
                    <dd>{formatCurrency(data.balance.income)}</dd>
                </div>
                <div className={styles.main}>
                    <dt>Saldo atual</dt>
                    <dd>{formatCurrency(data.balance.current)}</dd>
                </div>
                <div>
                    <dt>Despesas</dt>
                    <dd>{formatCurrency(data.balance.expenses)}</dd>
                </div>
            </dl>
        </Card>
    );
}
