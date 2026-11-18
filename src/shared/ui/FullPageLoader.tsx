import styles from './FullPageLoader.module.css';

export function FullPageLoader() {
    return (
        <div className={styles.wrap} role="status" aria-label="Carregando">
            <span className={styles.spinner} />
        </div>
    );
}
