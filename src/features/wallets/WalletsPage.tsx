import { useState } from 'react';
import { apiErrorMessage, t, tn } from '@/shared/i18n';
import { formatCurrency } from '@/shared/format/format';
import { PageHeader } from '@/shared/layout/PageHeader';
import { Alert, Button, ConfirmDialog, EditIcon, EmptyState, PlusIcon, Skeleton, TrashIcon, WalletIcon, useToast } from '@/shared/ui';
import { Card } from '@/features/dashboard/components/Card';
import { walletsApi, type Wallet } from './api/wallets.api';
import { WalletFormModal } from './components/WalletFormModal';
import { useWallets } from './hooks/useWallets';
import styles from './WalletsPage.module.css';

type Dialog = { kind: 'create' } | { kind: 'rename'; wallet: Wallet } | { kind: 'delete'; wallet: Wallet } | null;

export function WalletsPage() {
    const { state, reload } = useWallets();
    const toast = useToast();
    const [dialog, setDialog] = useState<Dialog>(null);
    const [deleting, setDeleting] = useState(false);

    const close = () => setDialog(null);

    function handleSaved(message: string) {
        close();
        toast(message);
        reload();
    }

    async function confirmDelete(wallet: Wallet) {
        setDeleting(true);
        try {
            await walletsApi.remove(wallet.id);
            toast(t('wallets.toast.deleted'));
            reload();
        } catch (error) {
            toast(apiErrorMessage(error), 'danger');
        } finally {
            setDeleting(false);
            close();
        }
    }

    const newButton = (
        <Button onClick={() => setDialog({ kind: 'create' })} data-tour="new-wallet">
            <PlusIcon size={18} /> {t('wallets.new')}
        </Button>
    );

    return (
        <>
            <PageHeader eyebrow={t('wallets.eyebrow')} title={t('wallets.title')} actions={newButton} />

            {state.status === 'loading' && (
                <div className={styles.grid}>
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} height={150} radius="var(--radius-xl)" />
                    ))}
                </div>
            )}

            {state.status === 'error' && (
                <div className={styles.error}>
                    <Alert tone="danger">{state.message}</Alert>
                    <Button variant="ghost" onClick={reload}>
                        {t('wallets.retry')}
                    </Button>
                </div>
            )}

            {state.status === 'ready' && state.data.length === 0 && (
                <Card>
                    <EmptyState
                        icon={<WalletIcon size={26} />}
                        title={t('wallets.empty.title')}
                        action={newButton}
                    >
                        {t('wallets.empty.body')}
                    </EmptyState>
                </Card>
            )}

            {state.status === 'ready' && state.data.length > 0 && (
                <div className={styles.content} aria-busy={state.refreshing}>
                    <Card tone="brand" tour="wallet-total">
                        <span className={styles.totalLabel}>{t('wallets.total')}</span>
                        <strong className={styles.total}>
                            {formatCurrency(state.data.reduce((sum, w) => sum + Number(w.balance), 0))}
                        </strong>
                        <span className={styles.totalHint}>
                            {tn('wallets.count', state.data.length)}
                        </span>
                    </Card>

                    <ul className={styles.grid}>
                        {state.data.map((wallet) => (
                            <li key={wallet.id} className={styles.wallet} data-tour="wallet-card">
                                <div className={styles.walletHead}>
                                    <span className={styles.walletIcon}>
                                        <WalletIcon />
                                    </span>
                                    <div className={styles.actions}>
                                        <button
                                            type="button"
                                            className={styles.iconButton}
                                            onClick={() => setDialog({ kind: 'rename', wallet })}
                                            aria-label={t('wallets.renameNamed', { name: wallet.name })}
                                            data-tour="wallet-edit"
                                            title={t('wallets.rename')}
                                        >
                                            <EditIcon size={17} />
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.iconButton} ${styles.danger}`}
                                            onClick={() => setDialog({ kind: 'delete', wallet })}
                                            aria-label={t('wallets.deleteNamed', { name: wallet.name })}
                                            data-tour="wallet-delete"
                                            title={t('wallets.delete')}
                                        >
                                            <TrashIcon size={17} />
                                        </button>
                                    </div>
                                </div>
                                <strong className={styles.name}>{wallet.name}</strong>
                                <span className={styles.balance}>{formatCurrency(wallet.balance)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {dialog?.kind === 'create' && <WalletFormModal onClose={close} onSaved={handleSaved} />}
            {dialog?.kind === 'rename' && <WalletFormModal wallet={dialog.wallet} onClose={close} onSaved={handleSaved} />}
            {dialog?.kind === 'delete' && (
                <ConfirmDialog
                    title={t('wallets.delete.title')}
                    confirmLabel={t('wallets.delete')}
                    loading={deleting}
                    onCancel={close}
                    onConfirm={() => void confirmDelete(dialog.wallet)}
                >
                    {t('wallets.delete.bodyA')}<strong>{dialog.wallet.name}</strong>{t('wallets.delete.bodyB')}
                </ConfirmDialog>
            )}
        </>
    );
}
