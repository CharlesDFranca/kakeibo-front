import styles from './ProgressBar.module.css';

export function ProgressBar({ percent, label }: { percent: number; label: string }) {
    return (
        <div className={styles.bar} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
            <span style={{ width: `${percent}%` }} />
        </div>
    );
}
