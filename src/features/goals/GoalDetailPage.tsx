import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiErrorMessage } from '@/shared/api/error-messages';
import { formatCurrency, formatLocalDate } from '@/shared/format/format';
import { PageHeader } from '@/shared/layout/PageHeader';
import { Alert, Button, ConfirmDialog, EmptyState, LockedFeature, Skeleton, TargetIcon, useToast } from '@/shared/ui';
import { Card } from '@/features/dashboard/components/Card';
import { useHasFeature } from '@/features/auth/hooks';
import { useWallets } from '@/features/wallets/hooks/useWallets';
import { goalsApi, type GoalDetails, type GoalMovement } from './api/goals.api';
import { DepositModal } from './components/DepositModal';
import { GoalFormModal } from './components/GoalFormModal';
import { GoalStatusBadge } from './components/GoalStatusBadge';
import { ProgressBar } from './components/ProgressBar';
import { ReactivateModal } from './components/ReactivateModal';
import { useGoal } from './hooks/useGoals';
import { progressOf, remainingOf } from './status';
import styles from './GoalDetailPage.module.css';

const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });

type Dialog = 'deposit' | 'rename' | 'cancel' | 'reactivate' | { revert: GoalMovement } | null;

export function GoalDetailPage() {
    const allowed = useHasFeature('GOALS');
    const { id = '' } = useParams();

    if (!allowed) {
        return (
            <>
                <PageHeader eyebrow="Planejamento" title="Meta" />
                <Card>
                    <LockedFeature feature="Metas financeiras" plan="Pro" description="Crie metas com prazo e acompanhe o progresso." />
                </Card>
            </>
        );
    }

    return <GoalDetail id={id} />;
}

function GoalDetail({ id }: { id: string }) {
    const toast = useToast();
    const { state, reload } = useGoal(id);
    const wallets = useWallets();
    const [dialog, setDialog] = useState<Dialog>(null);
    const [busy, setBusy] = useState(false);

    const walletList = wallets.state.status === 'ready' ? wallets.state.data : [];
    const walletName = (walletId: string) => walletList.find((w) => w.id === walletId)?.name ?? 'Carteira removida';
    const close = () => setDialog(null);

    function refresh(message: string) {
        close();
        toast(message);
        reload();
        wallets.reload();
    }

    async function run(action: () => Promise<unknown>, success: string) {
        setBusy(true);
        try {
            await action();
            refresh(success);
        } catch (error) {
            close();
            toast(apiErrorMessage(error), 'danger');
            reload(); // o estado pode ter mudado (ex.: meta expirou)
        } finally {
            setBusy(false);
        }
    }

    if (state.status === 'loading') {
        return (
            <>
                <PageHeader eyebrow="Planejamento" title="Meta" />
                <Skeleton height={260} radius="var(--radius-xl)" />
            </>
        );
    }

    if (state.status === 'error') {
        return (
            <>
                <PageHeader eyebrow="Planejamento" title="Meta" />
                <div className={styles.error}>
                    <Alert tone="danger">{state.message}</Alert>
                    <Button variant="ghost" onClick={reload}>
                        Tentar novamente
                    </Button>
                    <Link to="/metas">Voltar para as metas</Link>
                </div>
            </>
        );
    }

    const goal: GoalDetails = state.data;
    const pct = progressOf(goal);
    const remaining = remainingOf(goal);
    const inProgress = goal.status === 'IN PROGRESS';
    const movements = [...goal.movements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const actions = (
        <>
            {inProgress && remaining > 0 && <Button onClick={() => setDialog('deposit')}>Aportar</Button>}
            {goal.status === 'EXPIRED' && <Button onClick={() => setDialog('reactivate')}>Reativar</Button>}
            {goal.status !== 'CANCELLED' && (
                <Button variant="ghost" onClick={() => setDialog('rename')}>
                    Renomear
                </Button>
            )}
            {(inProgress || goal.status === 'EXPIRED') && (
                <Button variant="ghost" onClick={() => setDialog('cancel')}>
                    Cancelar meta
                </Button>
            )}
        </>
    );

    return (
        <>
            <PageHeader eyebrow="Metas" title={goal.name} actions={actions} />
            <Link to="/metas" className={styles.back}>
                ← Todas as metas
            </Link>

            <div className={styles.layout} aria-busy={state.refreshing}>
                <Card tone="brand">
                    <div className={styles.summaryHead}>
                        <span>Valor alcançado</span>
                        <GoalStatusBadge status={goal.status} />
                    </div>
                    <strong className={styles.current}>{formatCurrency(goal.currentAmount)}</strong>
                    <span className={styles.target}>de {formatCurrency(goal.targetAmount)}</span>
                    <div className={styles.bar}>
                        <ProgressBar percent={pct} label="Progresso da meta" />
                    </div>
                    <dl className={styles.facts}>
                        <div>
                            <dt>Progresso</dt>
                            <dd>{pct}%</dd>
                        </div>
                        <div>
                            <dt>Falta</dt>
                            <dd>{formatCurrency(remaining)}</dd>
                        </div>
                        <div>
                            <dt>Prazo</dt>
                            <dd>{goal.deadline ? formatLocalDate(goal.deadline) : 'Sem prazo'}</dd>
                        </div>
                    </dl>
                </Card>

                <Card title="Histórico de movimentações">
                    {movements.length === 0 ? (
                        <EmptyState icon={<TargetIcon size={26} />} title="Nenhum aporte ainda">
                            {inProgress ? 'Use "Aportar" para reservar dinheiro de uma carteira nesta meta.' : 'Esta meta não recebeu aportes.'}
                        </EmptyState>
                    ) : (
                        <ul className={styles.list}>
                            {movements.map((m) => {
                                const isDeposit = m.type === 'DEPOSIT';
                                const canRevert = isDeposit && !m.reverted && goal.status !== 'CANCELLED';
                                return (
                                    <li key={m.id} className={styles.item}>
                                        <div className={styles.info}>
                                            <strong>{isDeposit ? 'Aporte' : 'Estorno'}</strong>
                                            <span>
                                                {walletName(m.walletId)} · {dateTime.format(new Date(m.createdAt))}
                                                {m.reverted && ' · estornado'}
                                            </span>
                                        </div>
                                        <span className={`${styles.amount} ${isDeposit ? (m.reverted ? styles.struck : styles.in) : styles.out}`}>
                                            {isDeposit ? '+' : '-'}
                                            {formatCurrency(m.amount)}
                                        </span>
                                        {canRevert ? (
                                            <Button variant="ghost" onClick={() => setDialog({ revert: m })}>
                                                Estornar
                                            </Button>
                                        ) : (
                                            <span className={styles.spacer} />
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Card>
            </div>

            {dialog === 'deposit' && (
                <DepositModal
                    goalId={id}
                    goalName={goal.name}
                    remaining={remaining}
                    wallets={walletList}
                    onClose={close}
                    onSaved={() => refresh('Aporte realizado.')}
                />
            )}
            {dialog === 'rename' && <GoalFormModal goal={{ id, name: goal.name }} onClose={close} onSaved={refresh} />}
            {dialog === 'reactivate' && <ReactivateModal goalId={id} goalName={goal.name} onClose={close} onSaved={() => refresh('Meta reativada.')} />}
            {dialog === 'cancel' && (
                <ConfirmDialog
                    title="Cancelar meta"
                    confirmLabel="Cancelar meta"
                    loading={busy}
                    onCancel={close}
                    onConfirm={() => void run(() => goalsApi.cancel(id), 'Meta cancelada. Os aportes voltaram às carteiras.')}
                >
                    Cancelar <strong>{goal.name}</strong>? Todos os aportes ativos ({formatCurrency(goal.currentAmount)}) voltam para as carteiras de origem. Uma meta cancelada não pode ser reativada.
                </ConfirmDialog>
            )}
            {dialog !== null && typeof dialog === 'object' && (
                <ConfirmDialog
                    title="Estornar aporte"
                    confirmLabel="Estornar"
                    loading={busy}
                    onCancel={close}
                    onConfirm={() => void run(() => goalsApi.revertDeposit(id, dialog.revert.id), 'Aporte estornado.')}
                >
                    Devolver <strong>{formatCurrency(dialog.revert.amount)}</strong> para <strong>{walletName(dialog.revert.walletId)}</strong>?
                </ConfirmDialog>
            )}
        </>
    );
}
