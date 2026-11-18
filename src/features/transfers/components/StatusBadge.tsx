import type { TransferStatus } from '../api/transfers.api';
import styles from './StatusBadge.module.css';

const LABEL: Record<TransferStatus, string> = { COMPLETED: 'Concluída', REVERTED: 'Revertida' };

export function StatusBadge({ status }: { status: TransferStatus }) {
    return <span className={`${styles.badge} ${styles[status]}`}>{LABEL[status]}</span>;
}
