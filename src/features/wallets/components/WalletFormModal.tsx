import { useState, type FormEvent } from 'react';
import { apiErrorMessage } from '@/shared/api/error-messages';
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
        if (!name.trim()) found.name = 'Informe um nome.';
        if (name.trim().length > 100) found.name = 'O nome pode ter no máximo 100 caracteres.';
        const amount = editing ? '0.00' : parseMoneyInput(balance || '0');
        if (!editing && amount === null) found.balance = 'Informe um valor válido, como 1.500,00.';
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSaving(true);
        try {
            if (editing) {
                await walletsApi.rename(wallet.id, name.trim());
                onSaved('Carteira renomeada.');
            } else {
                await walletsApi.create({ name: name.trim(), balance: amount! });
                onSaved('Carteira criada.');
            }
        } catch (error) {
            setFormError(apiErrorMessage(error));
            setSaving(false);
        }
    }

    return (
        <Modal title={editing ? 'Renomear carteira' : 'Nova carteira'} onClose={onClose}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}

                <TextField
                    label="Nome"
                    placeholder="Ex.: Nubank, Dinheiro, Poupança"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    maxLength={100}
                />

                {!editing && (
                    <TextField
                        label="Saldo inicial"
                        inputMode="decimal"
                        placeholder="0,00"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        error={errors.balance}
                        hint="O saldo inicial vira a primeira movimentação da carteira."
                    />
                )}

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={saving}>
                        {editing ? 'Salvar' : 'Criar carteira'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
