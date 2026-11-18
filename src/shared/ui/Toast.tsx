import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import styles from './Toast.module.css';

type Tone = 'success' | 'danger';
type Toast = { id: number; message: string; tone: Tone };

const ToastContext = createContext<((message: string, tone?: Tone) => void) | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const notify = useCallback((message: string, tone: Tone = 'success') => {
        const id = nextId++;
        setToasts((list) => [...list, { id, message, tone }]);
        window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4500);
    }, []);

    const value = useMemo(() => notify, [notify]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className={styles.region} aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`${styles.toast} ${styles[t.tone]}`} role={t.tone === 'danger' ? 'alert' : 'status'}>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
    return ctx;
}
