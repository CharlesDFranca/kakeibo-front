import type { ReactNode } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import styles from './ConfirmDialog.module.css';

type Props = {
    title: string;
    children: ReactNode;
    confirmLabel: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({ title, children, confirmLabel, loading, onConfirm, onCancel }: Props) {
    return (
        <Modal title={title} onClose={onCancel}>
            <div className={styles.body}>{children}</div>
            <div className={styles.actions}>
                <Button variant="ghost" onClick={onCancel} disabled={loading ?? false}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={onConfirm} loading={loading ?? false}>
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}
