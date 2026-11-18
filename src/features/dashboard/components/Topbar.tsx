import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { initials } from '@/shared/format/format';
import { PERIODS, type PeriodId } from '../periods';
import styles from './Topbar.module.css';

type Props = { period: PeriodId; onPeriodChange: (p: PeriodId) => void };

export function Topbar({ period, onPeriodChange }: Props) {
    const { user } = useAuth();
    const displayName = user?.name || user?.username || '';

    return (
        <header className={styles.topbar}>
            <div>
                <span className={styles.eyebrow}>Olá, {displayName.split(' ')[0]}</span>
                <h1 className={styles.title}>Painel</h1>
            </div>

            <div className={styles.actions}>
                <label className={styles.select}>
                    <span className={styles.srOnly}>Período</span>
                    <select value={period} onChange={(e) => onPeriodChange(e.target.value as PeriodId)}>
                        {PERIODS.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </label>

                <Link to="/planos" className={styles.plan} title="Ver planos">
                    {user?.plan}
                </Link>
                <Link to="/perfil" className={styles.avatar} title="Perfil" aria-label={`Perfil de ${displayName}`}>
                    {initials(displayName)}
                </Link>
            </div>
        </header>
    );
}
