import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatCurrency, formatLocalDate } from '@/shared/format/format';
import { apiErrorMessage, intlTag, t } from '@/shared/i18n';
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

const formatDateTime = (iso: string) => new Intl.DateTimeFormat(intlTag(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

type Dialog = 'deposit' | 'rename' | 'cancel' | 'reactivate' | { revert: GoalMovement } | null;

export function GoalDetailPage() {
    const allowed = useHasFeature('GOALS');
    const { id = '' } = useParams();

    if (!allowed) {
        return (
            <>
                <PageHeader eyebrow={t('goals.eyebrow')} title={t('goals.detail.title')} />
                <Card>
                    <LockedFeature feature={t('goals.locked.feature')} plan="Pro" description={t('goals.detail.locked.description')} />
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
    const walletName = (walletId: string) => walletList.find((w) => w.id === walletId)?.name ?? t('goals.wallet.removed');
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
                <PageHeader eyebrow={t('goals.eyebrow')} title={t('goals.detail.title')} />
                <Skeleton height={260} radius="var(--radius-xl)" />
            </>
        );
    }

    if (state.status === 'error') {
        return (
            <>
                <PageHeader eyebrow={t('goals.eyebrow')} title={t('goals.detail.title')} />
                <div className={styles.error}>
                    <Alert tone="danger">{state.message}</Alert>
                    <Button variant="ghost" onClick={reload}>
                        {t('goals.retry')}
                    </Button>
                    <Link to="/metas">{t('goals.detail.backToGoals')}</Link>
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
            {inProgress && remaining > 0 && <Button onClick={() => setDialog('deposit')} data-tour="goal-deposit">
                    {t('goals.detail.deposit')}
                </Button>}
            {goal.status === 'EXPIRED' && <Button onClick={() => setDialog('reactivate')}>{t('goals.detail.reactivate')}</Button>}
            {goal.status !== 'CANCELLED' && (
                <Button variant="ghost" onClick={() => setDialog('rename')} data-tour="goal-rename">
                    {t('goals.detail.rename')}
                </Button>
            )}
            {(inProgress || goal.status === 'EXPIRED') && (
                <Button variant="ghost" onClick={() => setDialog('cancel')} data-tour="goal-cancel">
                    {t('goals.detail.cancel')}
                </Button>
            )}
        </>
    );

    return (
        <>
            <PageHeader eyebrow={t('goals.title')} title={goal.name} actions={actions} />
            <Link to="/metas" className={styles.back}>
                {t('goals.detail.back')}
            </Link>

            <div className={styles.layout} aria-busy={state.refreshing}>
                <Card tone="brand" tour="goal-summary">
                    <div className={styles.summaryHead}>
                        <span>{t('goals.detail.reached')}</span>
                        <GoalStatusBadge status={goal.status} />
                    </div>
                    <strong className={styles.current}>{formatCurrency(goal.currentAmount)}</strong>
                    <span className={styles.target}>{t('goals.detail.of', { target: formatCurrency(goal.targetAmount) })}</span>
                    <div className={styles.bar}>
                        <ProgressBar percent={pct} label={t('goals.detail.progressAria')} />
                    </div>
                    <dl className={styles.facts}>
                        <div>
                            <dt>{t('goals.detail.progress')}</dt>
                            <dd>{pct}%</dd>
                        </div>
                        <div>
                            <dt>{t('goals.detail.remaining')}</dt>
                            <dd>{formatCurrency(remaining)}</dd>
                        </div>
                        <div>
                            <dt>{t('goals.detail.deadline')}</dt>
                            <dd>{goal.deadline ? formatLocalDate(goal.deadline) : t('goals.detail.noDeadline')}</dd>
                        </div>
                    </dl>
                </Card>

                <Card title={t('goals.detail.history')} tour="goal-history">
                    {movements.length === 0 ? (
                        <EmptyState icon={<TargetIcon size={26} />} title={t('goals.detail.emptyHistory.title')}>
                            {inProgress ? t('goals.detail.emptyHistory.active') : t('goals.detail.emptyHistory.inactive')}
                        </EmptyState>
                    ) : (
                        <ul className={styles.list}>
                            {movements.map((m) => {
                                const isDeposit = m.type === 'DEPOSIT';
                                const canRevert = isDeposit && !m.reverted && goal.status !== 'CANCELLED';
                                return (
                                    <li key={m.id} className={styles.item}>
                                        <div className={styles.info}>
                                            <strong>{t(isDeposit ? 'goals.movement.DEPOSIT' : 'goals.movement.WITHDRAW')}</strong>
                                            <span>
                                                {walletName(m.walletId)} · {formatDateTime(m.createdAt)}
                                                {m.reverted && ` · ${t('goals.movement.reverted')}`}
                                            </span>
                                        </div>
                                        <span className={`${styles.amount} ${isDeposit ? (m.reverted ? styles.struck : styles.in) : styles.out}`}>
                                            {isDeposit ? '+' : '-'}
                                            {formatCurrency(m.amount)}
                                        </span>
                                        {canRevert ? (
                                            <Button variant="ghost" onClick={() => setDialog({ revert: m })} data-tour="goal-revert">
                                                {t('goals.movement.revert')}
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
                    onSaved={() => refresh(t('goals.toast.deposited'))}
                />
            )}
            {dialog === 'rename' && <GoalFormModal goal={{ id, name: goal.name }} onClose={close} onSaved={refresh} />}
            {dialog === 'reactivate' && <ReactivateModal goalId={id} goalName={goal.name} onClose={close} onSaved={() => refresh(t('goals.toast.reactivated'))} />}
            {dialog === 'cancel' && (
                <ConfirmDialog
                    title={t('goals.cancelDialog.title')}
                    confirmLabel={t('goals.detail.cancel')}
                    loading={busy}
                    onCancel={close}
                    onConfirm={() => void run(() => goalsApi.cancel(id), t('goals.toast.cancelled'))}
                >
                    {t('goals.cancelDialog.a')}
                    <strong>{goal.name}</strong>
                    {t('goals.cancelDialog.b', { amount: formatCurrency(goal.currentAmount) })}
                </ConfirmDialog>
            )}
            {dialog !== null && typeof dialog === 'object' && (
                <ConfirmDialog
                    title={t('goals.revertDialog.title')}
                    confirmLabel={t('goals.revertDialog.confirm')}
                    loading={busy}
                    onCancel={close}
                    onConfirm={() => void run(() => goalsApi.revertDeposit(id, dialog.revert.id), t('goals.toast.depositReverted'))}
                >
                    {t('goals.revertDialog.a')}
                    <strong>{formatCurrency(dialog.revert.amount)}</strong>
                    {t('goals.revertDialog.b')}
                    <strong>{walletName(dialog.revert.walletId)}</strong>
                    {t('goals.revertDialog.c')}
                </ConfirmDialog>
            )}
        </>
    );
}
