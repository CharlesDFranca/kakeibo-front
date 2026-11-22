import { t } from '@/shared/i18n';
import styles from './FullPageLoader.module.css';

export function FullPageLoader() {
    return (
        <div className={styles.wrap} role="status" aria-label={t('app.loading')}>
            <span className={styles.spinner} />
        </div>
    );
}
