import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatLocalDate, daysUntil } from '@/shared/format/format';
import { PageHeader } from '@/shared/layout/PageHeader';
import { Alert, Button, EmptyState, LockedFeature, PlusIcon, Skeleton, TargetIcon, useToast } from '@/shared/ui';
import { Card } from '@/features/dashboard/components/Card';
import { useHasFeature } from '@/features/auth/hooks';
import type { Goal } from './api/goals.api';
import { GoalFormModal } from './components/GoalFormModal';
import { GoalStatusBadge } from './components/GoalStatusBadge';
import { ProgressBar } from './components/ProgressBar';
import { useGoals } from './hooks/useGoals';
import { STATUS_FILTERS, progressOf } from './status';
import type { GoalStatus } from './api/goals.api';
import styles from './GoalsPage.module.css';

/** Metas exigem o plano Pro; sem ele mostramos o bloqueio e não chamamos a API. */
export function GoalsPage() {
    const allowed = useHasFeature('GOALS');

    if (!allowed) {
        return (
            <>
                <PageHeader eyebrow="Planejamento" title="Metas" />
                <Card>
                    <LockedFeature
                        feature="Metas financeiras"
                        plan="Pro"
                        description="Crie metas com prazo, faça aportes a partir das suas carteiras e acompanhe o progresso."
                    />
                </Card>
            </>
        );
    }

    return <GoalsContent />;
}

function deadlineLabel(goal: Goal): string | null {
    if (!goal.deadline) return null;
    if (goal.status !== 'IN PROGRESS') return `Prazo: ${formatLocalDate(goal.deadline)}`;
    const days = daysUntil(goal.deadline);
    return days === 0 ? 'Vence hoje' : `${days} ${days === 1 ? 'dia restante' : 'dias restantes'}`;
}

function GoalsContent() {
    const toast = useToast();
    const { state, reload } = useGoals();
    const [filter, setFilter] = useState<GoalStatus | ''>('');
    const [creating, setCreating] = useState(false);

    const newButton = (
        <Button onClick={() => setCreating(true)}>
            <PlusIcon size={18} /> Nova meta
        </Button>
    );

    const goals = state.status === 'ready' ? state.data : [];
    const visible = goals.filter((g) => !filter || g.status === filter);

    return (
        <>
            <PageHeader eyebrow="Planejamento" title="Metas" actions={newButton} />

            {state.status === 'loading' && (
                <div className={styles.grid}>
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} height={180} radius="var(--radius-xl)" />
                    ))}
                </div>
            )}

            {state.status === 'error' && (
                <div className={styles.error}>
                    <Alert tone="danger">{state.message}</Alert>
                    <Button variant="ghost" onClick={reload}>
                        Tentar novamente
                    </Button>
                </div>
            )}

            {state.status === 'ready' && goals.length === 0 && (
                <Card>
                    <EmptyState icon={<TargetIcon size={26} />} title="Nenhuma meta ainda" action={newButton}>
                        Defina um valor-alvo e um prazo, e faça aportes das suas carteiras até chegar lá.
                    </EmptyState>
                </Card>
            )}

            {state.status === 'ready' && goals.length > 0 && (
                <>
                    <div className={styles.tabs} role="group" aria-label="Filtrar por situação">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.value}
                                type="button"
                                aria-pressed={filter === f.value}
                                className={`${styles.tab} ${filter === f.value ? styles.tabActive : ''}`}
                                onClick={() => setFilter(f.value)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {visible.length === 0 ? (
                        <Card>
                            <EmptyState icon={<TargetIcon size={26} />} title="Nenhuma meta com esta situação">
                                Troque o filtro para ver as demais.
                            </EmptyState>
                        </Card>
                    ) : (
                        <ul className={styles.grid} aria-busy={state.refreshing}>
                            {visible.map((goal) => {
                                const pct = progressOf(goal);
                                const deadline = deadlineLabel(goal);
                                return (
                                    <li key={goal.id}>
                                        <Link to={`/metas/${goal.id}`} className={styles.card}>
                                            <div className={styles.cardHead}>
                                                <strong className={styles.name}>{goal.name}</strong>
                                                <GoalStatusBadge status={goal.status} />
                                            </div>
                                            <span className={styles.amounts}>
                                                {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                                            </span>
                                            <div className={styles.progress}>
                                                <div className={styles.row}>
                                                    <span>Progresso</span>
                                                    <span>{pct}%</span>
                                                </div>
                                                <ProgressBar percent={pct} label={`Progresso da meta ${goal.name}`} />
                                            </div>
                                            {deadline && <span className={styles.deadline}>{deadline}</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </>
            )}

            {creating && (
                <GoalFormModal
                    onClose={() => setCreating(false)}
                    onSaved={(message) => {
                        setCreating(false);
                        toast(message);
                        reload();
                    }}
                />
            )}
        </>
    );
}
