import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './TextField.module.css';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
    label: string;
    error?: string | undefined;
    hint?: string;
    icon?: ReactNode;
};

export function TextField({ label, error, hint, icon, type, ...rest }: Props) {
    const id = useId();
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div className={styles.field}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>

            <div className={`${styles.control} ${error ? styles.invalid : ''}`}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <input
                    {...rest}
                    id={id}
                    type={isPassword && visible ? 'text' : type}
                    className={styles.input}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                />
                {isPassword && (
                    <button
                        type="button"
                        className={styles.toggle}
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                        {visible ? 'Ocultar' : 'Mostrar'}
                    </button>
                )}
            </div>

            {error ? (
                <p id={`${id}-error`} className={styles.error} role="alert">
                    {error}
                </p>
            ) : hint ? (
                <p id={`${id}-hint`} className={styles.hint}>
                    {hint}
                </p>
            ) : null}
        </div>
    );
}
