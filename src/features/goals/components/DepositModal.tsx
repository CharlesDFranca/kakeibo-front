import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiErrorMessage } from '@/shared/api/error-messages';
import { formatCurrency } from '@/shared/format/format';
import { parseMoneyInput } from '@/shared/format/money-input';
import { Alert, Button, Modal, SelectField, TextField } from '@/shared/ui';
import type { Wallet } from '@/features/wallets/api/wallets.api';
import { goalsApi } from '../api/goals.api';
import styles from './Forms.module.css';

type Props = {
    goalId: string;
    goalName: string;
    /** Quanto falta para o valor-alvo. */
    remaining: number;
    wallets: Wallet[];
    onClose: () => void;
    onSaved: () => void;
};

export function DepositModal({ goalId, goalName, remaining, wallets, onClose, onSaved }: Props) {
    const [walletId, setWalletId] = useState(wallets.length === 1 ? (wallets[0]?.id ?? '') : '');
    const [amount, setAmount] = useState('');
    const [errors, setErrors] = useState<Partial<Record<'walletId' | 'amount', string>>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const wallet = wallets.find((w) => w.id === walletId);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        const parsed = parseMoneyInput(amount);
        const found: typeof errors = {};
        if (!walletId) found.walletId = 'Escolha de qual carteira sairá o dinheiro.';
        if (parsed === null || Number(parsed) <= 0) found.amount = 'Informe um valor maior que zero, como 300,00.';
        else if (Number(parsed) > remaining + 0.001) found.amount = `O aporte passa do que falta para a meta (${formatCurrency(remaining)}).`;
        else if (wallet && Number(parsed) > Number(wallet.balance)) found.amount = `Saldo insuficiente na carteira (${formatCurrency(wallet.balance)}).`;
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSaving(true);
        try {
            await goalsApi.deposit(goalId, { walletId, amount: parsed! });
            onSaved();
        } catch (error) {
            setFormError(apiErrorMessage(error));
            setSaving(false);
        }
    }

    if (wallets.length === 0) {
        return (
            <Modal title="Aportar na meta" onClose={onClose}>
                <p className={styles.notice}>Você precisa de uma carteira com saldo para aportar.</p>
                <div className={styles.actions}>
                    <Button variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>
                    <Link to="/carteiras" className={styles.linkButton}>
                        Ir para carteiras
                    </Link>
                </div>
            </Modal>
        );
    }

    return (
        <Modal title={`Aportar em ${goalName}`} onClose={onClose}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}

                <SelectField
                    label="Carteira de origem"
                    placeholder="Selecione"
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    options={wallets.map((w) => ({ value: w.id, label: `${w.name} · ${formatCurrency(w.balance)}` }))}
                    error={errors.walletId}
                />
                <TextField
                    label="Valor do aporte"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={errors.amount}
                    hint={`Faltam ${formatCurrency(remaining)} para a meta.`}
                />
                <p className={styles.note}>O valor sai da carteira e fica reservado na meta. Você pode estornar o aporte depois.</p>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={saving}>
                        Aportar
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
