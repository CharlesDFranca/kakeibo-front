import { useState } from 'react';
import { apiErrorMessage } from '@/shared/api/error-messages';
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
            toast('Carteira excluída.');
            reload();
        } catch (error) {
            toast(apiErrorMessage(error), 'danger');
        } finally {
            setDeleting(false);
            close();
        }
    }

    const newButton = (
        <Button onClick={() => setDialog({ kind: 'create' })}>
            <PlusIcon size={18} /> Nova carteira
        </Button>
    );

    return (
        <>
            <PageHeader eyebrow="Seu dinheiro" title="Carteiras" actions={newButton} />

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
                        Tentar novamente
                    </Button>
                </div>
            )}

            {state.status === 'ready' && state.data.length === 0 && (
                <Card>
                    <EmptyState
                        icon={<WalletIcon size={26} />}
                        title="Nenhuma carteira ainda"
                        action={newButton}
                    >
                        Carteiras guardam seu dinheiro (conta, cartão, dinheiro vivo). Crie a primeira para registrar transações.
                    </EmptyState>
                </Card>
            )}

            {state.status === 'ready' && state.data.length > 0 && (
                <div className={styles.content} aria-busy={state.refreshing}>
                    <Card tone="brand">
                        <span className={styles.totalLabel}>Saldo total</span>
                        <strong className={styles.total}>
                            {formatCurrency(state.data.reduce((sum, w) => sum + Number(w.balance), 0))}
                        </strong>
                        <span className={styles.totalHint}>
                            em {state.data.length} {state.data.length === 1 ? 'carteira' : 'carteiras'}
                        </span>
                    </Card>

                    <ul className={styles.grid}>
                        {state.data.map((wallet) => (
                            <li key={wallet.id} className={styles.wallet}>
                                <div className={styles.walletHead}>
                                    <span className={styles.walletIcon}>
                                        <WalletIcon />
                                    </span>
                                    <div className={styles.actions}>
                                        <button
                                            type="button"
                                            className={styles.iconButton}
                                            onClick={() => setDialog({ kind: 'rename', wallet })}
                                            aria-label={`Renomear ${wallet.name}`}
                                            title="Renomear"
                                        >
                                            <EditIcon size={17} />
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.iconButton} ${styles.danger}`}
                                            onClick={() => setDialog({ kind: 'delete', wallet })}
                                            aria-label={`Excluir ${wallet.name}`}
                                            title="Excluir"
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
                    title="Excluir carteira"
                    confirmLabel="Excluir"
                    loading={deleting}
                    onCancel={close}
                    onConfirm={() => void confirmDelete(dialog.wallet)}
                >
                    Excluir <strong>{dialog.wallet.name}</strong>? As transações dessa carteira também serão removidas e a ação não pode ser desfeita.
                </ConfirmDialog>
            )}
        </>
    );
}
