import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

export function Skeleton({ width = '100%', height = 16, radius }: { width?: string | number; height?: string | number; radius?: string }) {
    const style: CSSProperties = { width, height, ...(radius ? { borderRadius: radius } : {}) };
    return <span className={styles.skeleton} style={style} aria-hidden="true" />;
}
