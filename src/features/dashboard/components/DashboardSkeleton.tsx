import { t } from '@/shared/i18n';
import { Skeleton } from '@/shared/ui';
import styles from '../DashboardPage.module.css';

export function DashboardSkeleton() {
    return (
        <div className={styles.grid} aria-busy="true" aria-label={t('dashboard.loading')}>
            <div className={styles.main}>
                <Skeleton height={380} radius="var(--radius-xl)" />
                <div className={styles.summaries}>
                    <Skeleton height={150} radius="var(--radius-xl)" />
                    <Skeleton height={150} radius="var(--radius-xl)" />
                </div>
            </div>
            <div className={styles.side}>
                <Skeleton height={300} radius="var(--radius-xl)" />
                <Skeleton height={220} radius="var(--radius-xl)" />
            </div>
        </div>
    );
}
