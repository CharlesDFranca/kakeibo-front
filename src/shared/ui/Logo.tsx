import styles from './Logo.module.css';

export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
    return (
        <div className={`${styles.logo} ${styles[size]}`}>
            <span className={styles.mark} aria-hidden="true">
                K
            </span>
            <span className={styles.word}>Kakeibo</span>
        </div>
    );
}
