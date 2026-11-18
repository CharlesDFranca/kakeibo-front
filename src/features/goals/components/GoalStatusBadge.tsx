import type { GoalStatus } from '../api/goals.api';
import { STATUS_LABEL } from '../status';
import styles from './GoalStatusBadge.module.css';

const TONE: Record<GoalStatus, string> = {
    'IN PROGRESS': styles.progress ?? '',
    COMPLETED: styles.completed ?? '',
    EXPIRED: styles.expired ?? '',
    CANCELLED: styles.cancelled ?? '',
};

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
    return <span className={`${styles.badge} ${TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}
