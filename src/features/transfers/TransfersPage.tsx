import { useState } from 'react';
import { apiErrorMessage } from '@/shared/api/error-messages';
import { formatCurrency } from '@/shared/format/format';
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

const FILTERS: { value: TransferStatus | ''; label: string }[] = [
    { value: '', label: 'Todas' },
    { value: 'COMPLETED', label: 'Concluídas' },
    { value: 'REVERTED', label: 'Revertidas' },
];

/** Transferências exigem o plano Plus ou Pro; sem ele mostramos o bloqueio e não chamamos a API. */
export function TransfersPage() {
    const allowed = useHasFeature('TRANSFERS');

    if (!allowed) {
        return (
            <>
                <PageHeader eyebrow="Movimentações" title="Transferências" />
                <Card>
                    <LockedFeature
                        feature="Transferências entre carteiras"
                        plan="Plus"
                        description="Mova dinheiro entre suas carteiras e reverta quando precisar."
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
        toast('Transferência realizada.');
        reload();
        wallets.reload();
    }

    async function confirmRevert(transfer: Transfer) {
        setReverting(true);
        try {
            await transfersApi.revert(transfer.id);
            toast('Transferência revertida.');
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
        <Button onClick={() => setCreating(true)}>
            <PlusIcon size={18} /> Nova transferência
        </Button>
    );

    return (
        <>
            <PageHeader eyebrow="Movimentações" title="Transferências" actions={newButton} />

            <div className={styles.tabs} role="group" aria-label="Filtrar por situação">
                {FILTERS.map((f) => (
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
                        Tentar novamente
                    </Button>
                </div>
            )}

            {state.status === 'ready' && (
                <Card>
                    {state.data.length === 0 ? (
                        <EmptyState
                            icon={<SwapIcon size={26} />}
                            title={status ? 'Nenhuma transferência com esta situação' : 'Nenhuma transferência ainda'}
                            action={status ? undefined : newButton}
                        >
                            {status ? 'Troque o filtro para ver as demais.' : 'Mova dinheiro entre suas carteiras, como da conta para a reserva.'}
                        </EmptyState>
                    ) : (
                        <ul className={styles.list} aria-busy={state.refreshing}>
                            {[...state.data]
                                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                                .map((t) => (
                                    <li key={t.id} className={styles.row}>
                                        <button type="button" className={styles.open} onClick={() => setDetailId(t.id)}>
                                            <span className={styles.icon}>
                                                <SwapIcon size={18} />
                                            </span>
                                            <span className={styles.info}>
                                                <strong>
                                                    {t.sourceWallet.name} → {t.destinationWallet.name}
                                                </strong>
                                                <span>{formatDateTime(t.createdAt)}</span>
                                            </span>
                                            <span className={`${styles.amount} ${t.status === 'REVERTED' ? styles.struck : ''}`}>
                                                {formatCurrency(t.amount)}
                                            </span>
                                            <StatusBadge status={t.status} />
                                        </button>
                                        {t.status === 'COMPLETED' ? (
                                            <Button variant="ghost" onClick={() => setToRevert(t)} aria-label={`Reverter transferência de ${t.sourceWallet.name} para ${t.destinationWallet.name}`}>
                                                Reverter
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
                    title="Reverter transferência"
                    confirmLabel="Reverter"
                    loading={reverting}
                    onCancel={() => setToRevert(null)}
                    onConfirm={() => void confirmRevert(toRevert)}
                >
                    Devolver <strong>{formatCurrency(toRevert.amount)}</strong> de <strong>{toRevert.destinationWallet.name}</strong> para{' '}
                    <strong>{toRevert.sourceWallet.name}</strong>? Se a carteira de destino não tiver saldo suficiente, a reversão será recusada.
                </ConfirmDialog>
            )}
        </>
    );
}
