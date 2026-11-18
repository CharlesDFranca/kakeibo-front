import { useId, type SelectHTMLAttributes } from 'react';
import styles from './TextField.module.css';

type Option = { value: string; label: string };

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
    label: string;
    options: Option[];
    placeholder?: string;
    error?: string | undefined;
    hint?: string | undefined;
};

/** Select com o mesmo visual do TextField. */
export function SelectField({ label, options, placeholder, error, hint, ...rest }: Props) {
    const id = useId();

    return (
        <div className={styles.field}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>
            <div className={`${styles.control} ${error ? styles.invalid : ''}`}>
                <select {...rest} id={id} className={styles.input} aria-invalid={error ? true : undefined}>
                    {placeholder !== undefined && <option value="">{placeholder}</option>}
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>
            {error ? (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            ) : hint ? (
                <p className={styles.hint}>{hint}</p>
            ) : null}
        </div>
    );
}
