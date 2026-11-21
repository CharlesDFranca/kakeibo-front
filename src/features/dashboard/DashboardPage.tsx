import { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, Alert, Button } from '@/shared/ui';
import { t } from '@/shared/i18n';
import { formatCurrency } from '@/shared/format/format';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { ExpensesByCategory } from './components/ExpensesByCategory';
import { GoalsSection } from './components/GoalsSection';
import { OverviewCard } from './components/OverviewCard';
import { RecentTransactions } from './components/RecentTransactions';
import { SummaryCard } from './components/SummaryCard';
import { Topbar } from './components/Topbar';
import { useFinanceDashboard } from './hooks/useDashboard';
import { DEFAULT_PERIOD, periods, type PeriodId } from './periods';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
    const [period, setPeriod] = useState<PeriodId>(DEFAULT_PERIOD);
    const [reloadKey, setReloadKey] = useState(0);
    const state = useFinanceDashboard(period, reloadKey);
    const periodLabel = periods().find((p) => p.id === period)?.label.toLowerCase() ?? '';

    return (
        <>
            <Topbar period={period} onPeriodChange={setPeriod} />

            {state.status === 'loading' && <DashboardSkeleton />}

            {state.status === 'error' && (
                <div className={styles.error}>
                    <Alert tone="danger">{state.message}</Alert>
                    <Button variant="ghost" onClick={() => setReloadKey((k) => k + 1)}>
                        {t('dashboard.retry')}
                    </Button>
                </div>
            )}

            {state.status === 'ready' && (
                <div className={styles.grid}>
                    <div className={styles.main}>
                        <OverviewCard data={state.data} />

                        <div className={styles.summaries} data-tour="summaries">
                            <SummaryCard
                                tone="brand"
                                label={t('dashboard.income')}
                                value={formatCurrency(state.data.balance.income)}
                                hint={t('dashboard.incomeHint', { period: periodLabel })}
                                icon={<ArrowUpIcon />}
                            />
                            <SummaryCard
                                tone="accent"
                                label={t('dashboard.expenses')}
                                value={formatCurrency(state.data.balance.expenses)}
                                hint={t('dashboard.expensesHint', { period: periodLabel })}
                                icon={<ArrowDownIcon />}
                            />
                        </div>

                        <GoalsSection reloadKey={reloadKey} />
                    </div>

                    <aside className={styles.side} data-tour="dash-side">
                        <RecentTransactions items={state.data.recentTransactions} />
                        <ExpensesByCategory
                            items={state.data.expensesByCategory}
                            totalExpenses={state.data.balance.expenses}
                        />
                    </aside>
                </div>
            )}
        </>
    );
}
