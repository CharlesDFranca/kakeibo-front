import { t } from '@/shared/i18n';
import type { TransferStatus } from '../api/transfers.api';
import styles from './StatusBadge.module.css';

export function StatusBadge({ status }: { status: TransferStatus }) {
    return <span className={`${styles.badge} ${styles[status]}`}>{t(`transfers.status.${status}`)}</span>;
}
