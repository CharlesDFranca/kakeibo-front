import { useState } from 'react';
import { formatCurrency } from '@/shared/format/format';
import { apiErrorMessage, t } from '@/shared/i18n';
import { PageHeader } from '@/shared/layout/PageHeader';
import { Alert, Button, ConfirmDialog, EmptyState, LockedFeature, PlusIcon, Skeleton, SwapIcon, useToast } from '@/shared/ui';
import { Card } from '@/features/dashboard/components/Card';
import { useHasFeature } from '@/features/auth/hooks';
import { useWallets } from '@/features/wallets/hooks/useWallets';
import { transfersApi, type Transfer, type TransferStatus } from './api/transfers.api';
import { StatusBadge } from './components/StatusBadge';
import { TransferDetailModal, formatDateTime } from './components/TransferDetailModal';
import { TransferFormModal } from './components/TransferFormModal';
import { useTransfers } from './hooks/useTransfers';
import styles from './TransfersPage.module.css';

const filters = (): { value: TransferStatus | ''; label: string }[] => [
    { value: '', label: t('transfers.filter.all') },
    { value: 'COMPLETED', label: t('transfers.filter.completed') },
    { value: 'REVERTED', label: t('transfers.filter.reverted') },
];

/** Transferências exigem o plano Plus ou Pro; sem ele mostramos o bloqueio e não chamamos a API. */
export function TransfersPage() {
    const allowed = useHasFeature('TRANSFERS');

    if (!allowed) {
        return (
            <>
                <PageHeader eyebrow={t('transfers.eyebrow')} title={t('transfers.title')} />
                <Card>
                    <LockedFeature
                        feature={t('transfers.locked.feature')}
                        plan="Plus"
                        description={t('transfers.locked.description')}
                    />
                </Card>
            </>
        );
    }

    return <TransfersContent />;
}

function TransfersContent() {
    const toast = useToast();
    const [status, setStatus] = useState<TransferStatus | ''>('');
    const { state, reload } = useTransfers(status);
    const wallets = useWallets();
    const [creating, setCreating] = useState(false);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [toRevert, setToRevert] = useState<Transfer | null>(null);
    const [reverting, setReverting] = useState(false);

    const walletList = wallets.state.status === 'ready' ? wallets.state.data : [];

    function handleSaved() {
        setCreating(false);
        toast(t('transfers.toast.done'));
        reload();
        wallets.reload();
    }

    async function confirmRevert(transfer: Transfer) {
        setReverting(true);
        try {
            await transfersApi.revert(transfer.id);
            toast(t('transfers.toast.reverted'));
            reload();
            wallets.reload();
        } catch (error) {
            toast(apiErrorMessage(error), 'danger');
        } finally {
            setReverting(false);
            setToRevert(null);
        }
    }

    function askRevert(transfer: Transfer) {
        setDetailId(null);
        setToRevert(transfer);
    }

    const newButton = (
        <Button onClick={() => setCreating(true)} data-tour="new-transfer">
            <PlusIcon size={18} /> {t('transfers.new')}
        </Button>
    );

    return (
        <>
            <PageHeader eyebrow={t('transfers.eyebrow')} title={t('transfers.title')} actions={newButton} />

            <div className={styles.tabs} role="group" aria-label={t('transfers.filters.aria')} data-tour="transfer-filters">
                {filters().map((f) => (
                    <button
                        key={f.value}
                        type="button"
                        aria-pressed={status === f.value}
                        className={`${styles.tab} ${status === f.value ? styles.tabActive : ''}`}
                        onClick={() => setStatus(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {state.status === 'loading' && <Skeleton height={320} radius="var(--radius-xl)" />}

            {state.status === 'error' && (
                <div className={styles.error}>
                    <Alert tone="danger">{state.message}</Alert>
                    <Button variant="ghost" onClick={reload}>
                        {t('transfers.retry')}
                    </Button>
                </div>
            )}

            {state.status === 'ready' && (
                <Card tour="transfer-list">
                    {state.data.length === 0 ? (
                        <EmptyState
                            icon={<SwapIcon size={26} />}
                            title={status ? t('transfers.empty.filtered.title') : t('transfers.empty.title')}
                            action={status ? undefined : newButton}
                        >
                            {status ? t('transfers.empty.filtered.text') : t('transfers.empty.text')}
                        </EmptyState>
                    ) : (
                        <ul className={styles.list} aria-busy={state.refreshing}>
                            {[...state.data]
                                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                                .map((tr) => (
                                    <li key={tr.id} className={styles.row}>
                                        <button type="button" className={styles.open} onClick={() => setDetailId(tr.id)} data-tour="transfer-open">
                                            <span className={styles.icon}>
                                                <SwapIcon size={18} />
                                            </span>
                                            <span className={styles.info}>
                                                <strong>
                                                    {tr.sourceWallet.name} → {tr.destinationWallet.name}
                                                </strong>
                                                <span>{formatDateTime(tr.createdAt)}</span>
                                            </span>
                                            <span className={`${styles.amount} ${tr.status === 'REVERTED' ? styles.struck : ''}`}>
                                                {formatCurrency(tr.amount)}
                                            </span>
                                            <StatusBadge status={tr.status} />
                                        </button>
                                        {tr.status === 'COMPLETED' ? (
                                            <Button variant="ghost" onClick={() => setToRevert(tr)} data-tour="transfer-revert" aria-label={t('transfers.revert.aria', { source: tr.sourceWallet.name, destination: tr.destinationWallet.name })}>
                                                {t('transfers.revert')}
                                            </Button>
                                        ) : (
                                            <span className={styles.revertSpace} />
                                        )}
                                    </li>
                                ))}
                        </ul>
                    )}
                </Card>
            )}

            {creating && <TransferFormModal wallets={walletList} onClose={() => setCreating(false)} onSaved={handleSaved} />}

            {detailId && <TransferDetailModal transferId={detailId} onClose={() => setDetailId(null)} onRevert={askRevert} />}

            {toRevert && (
                <ConfirmDialog
                    title={t('transfers.revert.title')}
                    confirmLabel={t('transfers.revert')}
                    loading={reverting}
                    onCancel={() => setToRevert(null)}
                    onConfirm={() => void confirmRevert(toRevert)}
                >
                    {t('transfers.revert.confirm.a')}
                    <strong>{formatCurrency(toRevert.amount)}</strong>
                    {t('transfers.revert.confirm.b')}
                    <strong>{toRevert.destinationWallet.name}</strong>
                    {t('transfers.revert.confirm.c')}
                    <strong>{toRevert.sourceWallet.name}</strong>
                    {t('transfers.revert.confirm.d')}
                </ConfirmDialog>
            )}
        </>
    );
}
