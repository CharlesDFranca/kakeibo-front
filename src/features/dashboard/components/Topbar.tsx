import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { t } from '@/shared/i18n';
import { initials } from '@/shared/format/format';
import { periods, type PeriodId } from '../periods';
import styles from './Topbar.module.css';

type Props = { period: PeriodId; onPeriodChange: (p: PeriodId) => void };

export function Topbar({ period, onPeriodChange }: Props) {
    const { user } = useAuth();
    const displayName = user?.name || user?.username || '';

    return (
        <header className={styles.topbar}>
            <div>
                <span className={styles.eyebrow}>{t('dashboard.greeting', { name: displayName.split(' ')[0] ?? '' })}</span>
                <h1 className={styles.title}>{t('dashboard.title')}</h1>
            </div>

            <div className={styles.actions} data-tour="topbar-actions">
                <label className={styles.select} data-tour="period">
                    <span className={styles.srOnly}>{t('dashboard.period')}</span>
                    <select value={period} onChange={(e) => onPeriodChange(e.target.value as PeriodId)}>
                        {periods().map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </label>

                <Link to="/planos" className={styles.plan} title={t('dashboard.viewPlans')} data-tour="plan-badge">
                    {user?.plan}
                </Link>
                <Link to="/perfil" data-tour="avatar" className={styles.avatar} title={t('dashboard.profile')} aria-label={t('dashboard.profileOf', { name: displayName })}>
                    {initials(displayName)}
                </Link>
            </div>
        </header>
    );
}
