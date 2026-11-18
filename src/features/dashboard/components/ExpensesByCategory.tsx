import { formatCurrency } from '@/shared/format/format';
import { DonutChart, seriesColor } from '@/shared/ui/charts/DonutChart';
import type { FinanceDashboard } from '../api/dashboard.api';
import { Card } from './Card';
import { LockedFeature } from '@/shared/ui';
import styles from './ExpensesByCategory.module.css';

type Props = {
    items: FinanceDashboard['expensesByCategory'];
    totalExpenses: string;
};

const MAX_SLICES = 5;

/** Mostra as maiores categorias e agrupa o restante em "Outras". */
function groupSlices(items: NonNullable<Props['items']>) {
    const sorted = [...items].sort((a, b) => Number(b.amount) - Number(a.amount));
    const top = sorted.slice(0, MAX_SLICES - 1);
    const rest = sorted.slice(MAX_SLICES - 1);
    const slices = top.map((i) => ({ label: i.categoryName, value: Number(i.amount), percentage: i.percentage }));

    if (rest.length === 1) {
        const r = rest[0]!;
        slices.push({ label: r.categoryName, value: Number(r.amount), percentage: r.percentage });
    } else if (rest.length > 1) {
        slices.push({
            label: 'Outras',
            value: rest.reduce((s, i) => s + Number(i.amount), 0),
            percentage: rest.reduce((s, i) => s + i.percentage, 0),
        });
    }
    return slices;
}

export function ExpensesByCategory({ items, totalExpenses }: Props) {
    return (
        <Card title="Despesas por categoria">
            {items === null ? (
                <LockedFeature
                    feature="Análise por categoria"
                    plan="Plus"
                    description="Veja para onde seu dinheiro está indo, categoria por categoria."
                />
            ) : items.length === 0 ? (
                <p className={styles.empty}>Sem despesas neste período.</p>
            ) : (
                <ExpensesChart items={items} totalExpenses={totalExpenses} />
            )}
        </Card>
    );
}

function ExpensesChart({ items, totalExpenses }: { items: NonNullable<Props['items']>; totalExpenses: string }) {
    const slices = groupSlices(items);

    return (
        <div className={styles.body}>
            <DonutChart
                slices={slices}
                centerLabel="Total"
                centerValue={formatCurrency(totalExpenses)}
            />
            <ul className={styles.legend}>
                {slices.map((s, i) => (
                    <li key={s.label}>
                        <span className={styles.swatch} style={{ background: seriesColor(i) }} />
                        <span className={styles.name}>{s.label}</span>
                        <span className={styles.pct}>{Math.round(s.percentage)}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
