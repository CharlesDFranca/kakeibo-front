import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost' | 'danger';
    loading?: boolean;
    fullWidth?: boolean;
};

export function Button({
    variant = 'primary',
    loading = false,
    fullWidth = false,
    disabled,
    className,
    children,
    ...rest
}: Props) {
    const classes = [
        styles.button,
        styles[variant],
        fullWidth ? styles.full : '',
        className ?? '',
    ].join(' ');

    return (
        <button {...rest} className={classes} disabled={disabled || loading}>
            {loading && <span className={styles.spinner} aria-hidden="true" />}
            {children}
        </button>
    );
}
