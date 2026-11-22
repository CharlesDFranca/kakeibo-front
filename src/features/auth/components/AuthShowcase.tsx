import { t } from '@/shared/i18n';
import styles from './AuthShowcase.module.css';

/** Painel decorativo inspirado no dashboard de referência. */
export function AuthShowcase() {
    return (
        <div className={styles.root}>
            <div className={styles.copy}>
                <h2 className={styles.headline}>{t('auth.showcase.headline')}</h2>
                <p className={styles.text}>{t('auth.showcase.text')}</p>
            </div>

            <div className={styles.overview}>
                <div className={styles.overviewHead}>
                    <span>{t('auth.showcase.overview')}</span>
                    <span className={styles.chip}>{t('auth.showcase.monthly')}</span>
                </div>

                <svg
                    className={styles.chart}
                    viewBox="0 0 320 110"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="showcase-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0 80 C 30 40, 60 40, 90 66 S 150 100, 180 58 S 250 20, 320 48 L320 110 L0 110 Z"
                        fill="url(#showcase-fill)"
                    />
                    <path
                        d="M0 80 C 30 40, 60 40, 90 66 S 150 100, 180 58 S 250 20, 320 48"
                        fill="none"
                        stroke="var(--color-accent-primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>

                <div className={styles.stats}>
                    <div>
                        <span className={styles.statLabel}>{t('auth.showcase.income')}</span>
                        <strong>R$ 8.450</strong>
                    </div>
                    <div className={styles.statMain}>
                        <span className={styles.statLabel}>{t('auth.showcase.totalBalance')}</span>
                        <strong>R$ 12.980</strong>
                    </div>
                    <div>
                        <span className={styles.statLabel}>{t('auth.showcase.expenses')}</span>
                        <strong>R$ 3.120</strong>
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.goal}>
                    <span className={styles.statLabel}>{t('auth.showcase.goal')}</span>
                    <div className={styles.bar}>
                        <span style={{ width: '72%' }} />
                    </div>
                    <small>{t('auth.showcase.goalDone')}</small>
                </div>
                <div className={styles.pill}>
                    <span className={styles.statLabel}>{t('auth.showcase.transfer')}</span>
                    <strong>{t('auth.showcase.transferExample')}</strong>
                </div>
            </div>
        </div>
    );
}
