import { useState, type FormEvent } from 'react';
import { apiErrorMessage, t } from '@/shared/i18n';
import { parseMoneyInput } from '@/shared/format/money-input';
import { Alert, Button, Modal, TextField } from '@/shared/ui';
import { walletsApi, type Wallet } from '../api/wallets.api';
import styles from './WalletFormModal.module.css';

type Props = {
    /** Se informado, é edição (só o nome muda). */
    wallet?: Wallet;
    onClose: () => void;
    onSaved: (message: string) => void;
};

export function WalletFormModal({ wallet, onClose, onSaved }: Props) {
    const editing = wallet !== undefined;
    const [name, setName] = useState(wallet?.name ?? '');
    const [balance, setBalance] = useState('');
    const [errors, setErrors] = useState<{ name?: string; balance?: string }>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        const found: typeof errors = {};
        if (!name.trim()) found.name = t('wallets.form.error.nameRequired');
        if (name.trim().length > 100) found.name = t('wallets.form.error.nameTooLong');
        const amount = editing ? '0.00' : parseMoneyInput(balance || '0');
        if (!editing && amount === null) found.balance = t('wallets.form.error.balanceInvalid');
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSaving(true);
        try {
            if (editing) {
                await walletsApi.rename(wallet.id, name.trim());
                onSaved(t('wallets.toast.renamed'));
            } else {
                await walletsApi.create({ name: name.trim(), balance: amount! });
                onSaved(t('wallets.toast.created'));
            }
        } catch (error) {
            setFormError(apiErrorMessage(error));
            setSaving(false);
        }
    }

    return (
        <Modal title={editing ? t('wallets.form.titleEdit') : t('wallets.form.titleNew')} onClose={onClose}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}

                <TextField
                    label={t('wallets.form.name')}
                    placeholder={t('wallets.form.namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    maxLength={100}
                />

                {!editing && (
                    <TextField
                        label={t('wallets.form.balance')}
                        inputMode="decimal"
                        placeholder={t('wallets.form.balancePlaceholder')}
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        error={errors.balance}
                        hint={t('wallets.form.balanceHint')}
                    />
                )}

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                        {t('wallets.form.cancel')}
                    </Button>
                    <Button type="submit" loading={saving}>
                        {editing ? t('wallets.form.save') : t('wallets.form.create')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
