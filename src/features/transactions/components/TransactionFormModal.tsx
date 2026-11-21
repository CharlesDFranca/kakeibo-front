import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiErrorMessage, categoryLabel, t } from '@/shared/i18n';
import { formatCurrency } from '@/shared/format/format';
import { parseMoneyInput } from '@/shared/format/money-input';
import { toDateOnly } from '@/features/dashboard/periods';
import type { Category } from '@/features/categories/api/categories.api';
import type { Wallet } from '@/features/wallets/api/wallets.api';
import { Alert, Button, Modal, SelectField, TextField } from '@/shared/ui';
import { transactionsApi } from '../api/transactions.api';
import { dateInputToIso } from '../dates';
import styles from './TransactionFormModal.module.css';

type Kind = 'EXPENSE' | 'INCOME';

type Props = {
    wallets: Wallet[];
    categories: Category[];
    onCreateCategory: (name: string) => Promise<string>;
    onClose: () => void;
    onSaved: () => void;
};

type Errors = Partial<Record<'amount' | 'date' | 'walletId' | 'categoryId', string>>;

export function TransactionFormModal({ wallets, categories, onCreateCategory, onClose, onSaved }: Props) {
    const today = toDateOnly(new Date());
    const [kind, setKind] = useState<Kind>('EXPENSE');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(today);
    const [walletId, setWalletId] = useState(wallets.length === 1 ? (wallets[0]?.id ?? '') : '');
    const [categoryId, setCategoryId] = useState('');
    const [newCategory, setNewCategory] = useState<string | null>(null);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const wallet = wallets.find((w) => w.id === walletId);

    async function handleCreateCategory() {
        const name = (newCategory ?? '').trim();
        if (!name) return;
        setCreatingCategory(true);
        setFormError(null);
        try {
            setCategoryId(await onCreateCategory(name));
            setNewCategory(null);
        } catch (error) {
            setFormError(apiErrorMessage(error));
        } finally {
            setCreatingCategory(false);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        const parsed = parseMoneyInput(amount);
        const found: Errors = {};
        if (parsed === null || Number(parsed) <= 0) found.amount = t('transactions.form.error.amount');
        if (!date) found.date = t('transactions.form.error.date');
        else if (date > today) found.date = t('transactions.form.error.dateFuture');
        if (!walletId) found.walletId = t('transactions.form.error.wallet');
        if (!categoryId) found.categoryId = t('transactions.form.error.category');
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSaving(true);
        try {
            const text = description.trim();
            await transactionsApi.create({
                amount: parsed!,
                ...(text ? { description: text } : {}),
                date: dateInputToIso(date),
                type: kind,
                categoryId,
                walletId,
            });
            onSaved();
        } catch (error) {
            setFormError(apiErrorMessage(error));
            setSaving(false);
        }
    }

    if (wallets.length === 0) {
        return (
            <Modal title={t('transactions.form.title')} onClose={onClose}>
                <p className={styles.notice} data-tour="modal-notice">
                    {t('transactions.form.noWallet')}
                </p>
                <div className={styles.actions}>
                    <Button variant="ghost" onClick={onClose}>
                        {t('transactions.form.close')}
                    </Button>
                    <Link to="/carteiras" className={styles.linkButton}>
                        {t('transactions.form.createWallet')}
                    </Link>
                </div>
            </Modal>
        );
    }

    return (
        <Modal title={t('transactions.form.title')} onClose={onClose}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}

                <div className={styles.segmented} role="group" aria-label={t('transactions.form.kind')} data-tour="tx-type">
                    {(
                        [
                            ['EXPENSE', t('transactions.type.EXPENSE')],
                            ['INCOME', t('transactions.type.INCOME')],
                        ] as const
                    ).map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={kind === value}
                            className={`${styles.segment} ${kind === value ? styles[`on_${value}`] : ''}`}
                            onClick={() => setKind(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <TextField
                    label={t('transactions.form.amount')}
                    inputMode="decimal"
                    placeholder={t('transactions.form.amountPlaceholder')}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={errors.amount}
                />
                <TextField
                    label={t('transactions.form.description')}
                    placeholder={t('transactions.form.descriptionPlaceholder')}
                    maxLength={200}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    label={t('transactions.form.date')}
                    type="date"
                    max={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    error={errors.date}
                />
                <SelectField
                    label={t('transactions.form.wallet')}
                    placeholder={t('transactions.form.select')}
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    options={wallets.map((w) => ({ value: w.id, label: w.name }))}
                    error={errors.walletId}
                    hint={wallet ? t('transactions.form.walletBalance', { amount: formatCurrency(wallet.balance) }) : undefined}
                />

                {newCategory === null ? (
                    <div className={styles.categoryRow} data-tour="tx-category">
                        <SelectField
                            label={t('transactions.form.category')}
                            placeholder={t('transactions.form.select')}
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            options={categories.map((c) => ({ value: c.id, label: categoryLabel(c.name) }))}
                            error={errors.categoryId}
                        />
                        <button type="button" className={styles.link} onClick={() => setNewCategory('')}>
                            {t('transactions.form.newCategoryLink')}
                        </button>
                    </div>
                ) : (
                    <div className={styles.newCategory}>
                        <TextField
                            label={t('transactions.form.newCategory')}
                            placeholder={t('transactions.form.newCategoryPlaceholder')}
                            maxLength={100}
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        />
                        <div className={styles.newCategoryActions}>
                            <Button type="button" variant="ghost" onClick={() => setNewCategory(null)} disabled={creatingCategory}>
                                {t('transactions.form.cancel')}
                            </Button>
                            <Button type="button" onClick={() => void handleCreateCategory()} loading={creatingCategory}>
                                {t('transactions.form.createCategory')}
                            </Button>
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                        {t('transactions.form.cancel')}
                    </Button>
                    <Button type="submit" loading={saving}>
                        {t('transactions.form.submit')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
