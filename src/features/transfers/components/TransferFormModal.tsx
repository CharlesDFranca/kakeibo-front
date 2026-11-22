import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/shared/format/format';
import { apiErrorMessage, t } from '@/shared/i18n';
import { parseMoneyInput } from '@/shared/format/money-input';
import { Alert, Button, Modal, SelectField, TextField } from '@/shared/ui';
import type { Wallet } from '@/features/wallets/api/wallets.api';
import { transfersApi } from '../api/transfers.api';
import styles from './TransferFormModal.module.css';

type Props = { wallets: Wallet[]; onClose: () => void; onSaved: () => void };
type Errors = Partial<Record<'source' | 'destination' | 'amount', string>>;

export function TransferFormModal({ wallets, onClose, onSaved }: Props) {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [amount, setAmount] = useState('');
    const [errors, setErrors] = useState<Errors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const sourceWallet = wallets.find((w) => w.id === source);

    function swap() {
        setSource(destination);
        setDestination(source);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        const parsed = parseMoneyInput(amount);
        const found: Errors = {};
        if (!source) found.source = t('transfers.error.source');
        if (!destination) found.destination = t('transfers.error.destination');
        else if (destination === source) found.destination = t('transfers.error.sameWallet');
        if (parsed === null || Number(parsed) <= 0) found.amount = t('transfers.error.amount');
        else if (sourceWallet && Number(parsed) > Number(sourceWallet.balance)) {
            found.amount = t('transfers.error.insufficient', { amount: formatCurrency(sourceWallet.balance) });
        }
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSaving(true);
        try {
            await transfersApi.create({ amount: parsed!, sourceWalletId: source, destinationWalletId: destination });
            onSaved();
        } catch (error) {
            setFormError(apiErrorMessage(error));
            setSaving(false);
        }
    }

    if (wallets.length < 2) {
        return (
            <Modal title={t('transfers.form.title')} onClose={onClose}>
                <p className={styles.notice} data-tour="modal-notice">{t('transfers.form.needTwo')}</p>
                <div className={styles.actions}>
                    <Button variant="ghost" onClick={onClose}>
                        {t('transfers.close')}
                    </Button>
                    <Link to="/carteiras" className={styles.linkButton}>
                        {t('transfers.form.goWallets')}
                    </Link>
                </div>
            </Modal>
        );
    }

    const options = wallets.map((w) => ({ value: w.id, label: `${w.name} · ${formatCurrency(w.balance)}` }));

    return (
        <Modal title={t('transfers.form.title')} onClose={onClose}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}

                <SelectField
                    label={t('transfers.form.source')}
                    placeholder={t('transfers.form.select')}
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    options={options}
                    error={errors.source}
                />

                <button type="button" className={styles.swap} onClick={swap} disabled={!source && !destination}>
                    {t('transfers.form.swap')}
                </button>

                <SelectField
                    label={t('transfers.form.destination')}
                    placeholder={t('transfers.form.select')}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    options={options.filter((o) => o.value !== source)}
                    error={errors.destination}
                />

                <TextField
                    label={t('transfers.form.amount')}
                    inputMode="decimal"
                    placeholder={t('transfers.form.amountPlaceholder')}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={errors.amount}
                    hint={sourceWallet ? t('transfers.form.available', { amount: formatCurrency(sourceWallet.balance) }) : undefined}
                />

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                        {t('transfers.form.cancel')}
                    </Button>
                    <Button type="submit" loading={saving}>
                        {t('transfers.form.submit')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
