import { formatCurrency } from '@/shared/format/format';
import { intlTag, t } from '@/shared/i18n';
import { Alert, Button, Modal, Skeleton } from '@/shared/ui';
import { useAsyncData } from '@/shared/hooks/useAsyncData';
import { transfersApi, type Transfer } from '../api/transfers.api';
import { StatusBadge } from './StatusBadge';
import styles from './TransferDetailModal.module.css';

export const formatDateTime = (iso: string) => new Intl.DateTimeFormat(intlTag(), { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso));

type Props = { transferId: string; onClose: () => void; onRevert: (transfer: Transfer) => void };

/** Detalhe de uma transferência (GET /transfers/:id). */
export function TransferDetailModal({ transferId, onClose, onRevert }: Props) {
    const { state } = useAsyncData(() => transfersApi.find(transferId), [transferId]);

    return (
        <Modal title={t('transfers.detail.title')} onClose={onClose}>
            {state.status === 'loading' && (
                <div className={styles.loading}>
                    <Skeleton height={28} />
                    <Skeleton height={120} />
                </div>
            )}
            {state.status === 'error' && <Alert tone="danger">{state.message}</Alert>}
            {state.status === 'ready' && (
                <>
                    <div className={styles.head}>
                        <strong className={styles.amount}>{formatCurrency(state.data.amount)}</strong>
                        <StatusBadge status={state.data.status} />
                    </div>
                    <dl className={styles.list}>
                        <div>
                            <dt>{t('transfers.detail.source')}</dt>
                            <dd>{state.data.sourceWallet.name}</dd>
                        </div>
                        <div>
                            <dt>{t('transfers.detail.destination')}</dt>
                            <dd>{state.data.destinationWallet.name}</dd>
                        </div>
                        <div>
                            <dt>{t('transfers.detail.createdAt')}</dt>
                            <dd>{formatDateTime(state.data.createdAt)}</dd>
                        </div>
                        {state.data.status === 'REVERTED' && (
                            <div>
                                <dt>{t('transfers.detail.revertedAt')}</dt>
                                <dd>{formatDateTime(state.data.updatedAt)}</dd>
                            </div>
                        )}
                    </dl>
                    <div className={styles.actions}>
                        <Button variant="ghost" onClick={onClose}>
                            {t('transfers.close')}
                        </Button>
                        {state.data.status === 'COMPLETED' && (
                            <Button variant="danger" onClick={() => onRevert(state.data)}>
                                {t('transfers.revert')}
                            </Button>
                        )}
                    </div>
                </>
            )}
        </Modal>
    );
}
