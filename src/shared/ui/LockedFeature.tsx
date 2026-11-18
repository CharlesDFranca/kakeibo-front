import { LockIcon } from './icons';
import styles from './LockedFeature.module.css';

type Props = { feature: string; plan: 'Plus' | 'Pro'; description: string };

/** Mostra o recurso bloqueado pelo plano atual (Tabela 28 do documento). */
export function LockedFeature({ feature, plan, description }: Props) {
    return (
        <div className={styles.locked}>
            <span className={styles.icon}>
                <LockIcon />
            </span>
            <strong>{feature}</strong>
            <p>{description}</p>
            <span className={styles.badge}>Disponível no plano {plan}</span>
        </div>
    );
}
