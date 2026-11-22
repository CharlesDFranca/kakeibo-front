import { t } from '@/shared/i18n';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { CloseIcon } from './icons';
import styles from './Modal.module.css';

type Props = { title: string; onClose: () => void; children: ReactNode };

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]';

/** Diálogo acessível: ESC fecha, foco preso dentro, foco volta ao elemento de origem. */
export function Modal({ title, onClose, children }: Props) {
    const titleId = useId();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        const node = ref.current;
        document.body.style.overflow = 'hidden';

        // foca o primeiro campo (ou o botão de fechar)
        const touch = window.matchMedia?.('(pointer: coarse)').matches ?? false;
        // em celular, focar um campo abre o teclado e dá zoom: foca o botão
        (touch ? node?.querySelector<HTMLElement>('button') : (node?.querySelector<HTMLElement>('input, select, textarea') ?? node?.querySelector<HTMLElement>('button')))?.focus();

        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key !== 'Tab' || !node) return;
            const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
            const first = items[0];
            const last = items[items.length - 1];
            if (!first || !last) return;
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }

        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
            previous?.focus();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div ref={ref} className={styles.dialog} data-tour="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
                <header className={styles.header}>
                    <h2 id={titleId} className={styles.title}>
                        {title}
                    </h2>
                    <button type="button" className={styles.close} onClick={onClose} aria-label={t('app.close')} data-tour="modal-close">
                        <CloseIcon size={18} />
                    </button>
                </header>
                {children}
            </div>
        </div>
    );
}
