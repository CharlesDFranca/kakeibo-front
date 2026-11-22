import { Link } from 'react-router-dom';
import { t, tn } from '@/shared/i18n';
import { daysUntil, formatCurrency } from '@/shared/format/format';
import { Skeleton } from '@/shared/ui';
import { useGoalsDashboard } from '../hooks/useDashboard';
import { Card } from './Card';
import { LockedFeature } from '@/shared/ui';
import styles from './GoalsSection.module.css';

/** Usa o percentual da API; se faltar ou vier inválido, calcula pelos valores. */
function percentOf(goal: { percentage?: number; currentAmount: string; targetAmount: string }): number {
    const fromApi = Number(goal.percentage);
    if (Number.isFinite(fromApi)) return Math.min(100, Math.max(0, Math.round(fromApi)));
    const target = Number(goal.targetAmount);
    const current = Number(goal.currentAmount);
    if (!(target > 0) || !Number.isFinite(current)) return 0;
    return Math.min(100, Math.round((current / target) * 100));
}

export function GoalsSection({ reloadKey }: { reloadKey: number }) {
    const { allowed, state } = useGoalsDashboard(reloadKey);

    return (
        <Card tour="goals-dash" title={t('dashboard.goals.title')} action={allowed ? <Link to="/metas">{t('dashboard.goals.viewAll')}</Link> : undefined}>
            {!allowed ? (
                <LockedFeature
                    feature={t('dashboard.goals.locked')}
                    plan="Pro"
                    description={t('dashboard.goals.lockedDesc')}
                />
            ) : state.status === 'loading' ? (
                <div className={styles.grid}>
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} height={120} radius="var(--radius-lg)" />
                    ))}
                </div>
            ) : state.status === 'error' ? (
                <p className={styles.message}>{state.message}</p>
            ) : state.data.length === 0 ? (
                <p className={styles.message}>{t('dashboard.goals.empty')}</p>
            ) : (
                <ul className={styles.grid}>
                    {state.data.map((goal) => {
                        const pct = percentOf(goal);
                        const rawDays = goal.deadline ? daysUntil(goal.deadline) : null;
                        const days = rawDays !== null && Number.isFinite(rawDays) ? rawDays : null;
                        return (
                            <li key={goal.id} className={styles.goal}>
                                <Link to={`/metas/${goal.id}`} className={styles.name}>
                                    {goal.name}
                                </Link>
                                <span className={styles.amounts}>
                                    {t('dashboard.goals.amounts', { current: formatCurrency(goal.currentAmount), target: formatCurrency(goal.targetAmount) })}
                                </span>
                                <div className={styles.progress}>
                                    <div className={styles.row}>
                                        <span>{t('dashboard.goals.progress')}</span>
                                        <span>{pct}%</span>
                                    </div>
                                    <div
                                        className={styles.bar}
                                        role="progressbar"
                                        aria-valuenow={pct}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={t('dashboard.goals.progressOf', { name: goal.name })}
                                    >
                                        <span style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                                {days !== null && (
                                    <span className={styles.days}>
                                        {days === 0 ? t('dashboard.goals.dueToday') : tn('dashboard.goals.daysLeft', days)}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </Card>
    );
}
