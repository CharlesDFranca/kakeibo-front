import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/shared/format/format';
import { apiErrorMessage, t } from '@/shared/i18n';
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
        if (!walletId) found.walletId = t('goals.deposit.error.wallet');
        if (parsed === null || Number(parsed) <= 0) found.amount = t('goals.deposit.error.amount');
        else if (Number(parsed) > remaining + 0.001) found.amount = t('goals.deposit.error.exceeds', { amount: formatCurrency(remaining) });
        else if (wallet && Number(parsed) > Number(wallet.balance)) found.amount = t('goals.deposit.error.insufficient', { amount: formatCurrency(wallet.balance) });
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
            <Modal title={t('goals.deposit.titleNoWallet')} onClose={onClose}>
                <p className={styles.notice} data-tour="modal-notice">{t('goals.deposit.needWallet')}</p>
                <div className={styles.actions}>
                    <Button variant="ghost" onClick={onClose}>
                        {t('goals.deposit.close')}
                    </Button>
                    <Link to="/carteiras" className={styles.linkButton}>
                        {t('goals.deposit.goWallets')}
                    </Link>
                </div>
            </Modal>
        );
    }

    return (
        <Modal title={t('goals.deposit.title', { name: goalName })} onClose={onClose}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}

                <SelectField
                    label={t('goals.deposit.wallet')}
                    placeholder={t('goals.deposit.select')}
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    options={wallets.map((w) => ({ value: w.id, label: `${w.name} · ${formatCurrency(w.balance)}` }))}
                    error={errors.walletId}
                />
                <TextField
                    label={t('goals.deposit.amount')}
                    inputMode="decimal"
                    placeholder={t('goals.deposit.amountPlaceholder')}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={errors.amount}
                    hint={t('goals.deposit.hint', { amount: formatCurrency(remaining) })}
                />
                <p className={styles.note}>{t('goals.deposit.note')}</p>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                        {t('goals.form.cancel')}
                    </Button>
                    <Button type="submit" loading={saving}>
                        {t('goals.deposit.submit')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
