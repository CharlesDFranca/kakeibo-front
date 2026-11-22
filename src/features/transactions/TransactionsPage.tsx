import { useMemo, useState } from 'react';
import { apiErrorMessage, categoryLabel, descriptionLabel, intlTag, t } from '@/shared/i18n';
import { formatCurrency, formatDayMonth } from '@/shared/format/format';
import { PageHeader } from '@/shared/layout/PageHeader';
import {
    Alert,
    ArrowDownIcon,
    ArrowUpIcon,
    Button,
    ConfirmDialog,
    EmptyState,
    ListIcon,
    PlusIcon,
    SelectField,
    Skeleton,
    SwapIcon,
    TrashIcon,
    useToast,
} from '@/shared/ui';
import { Card } from '@/features/dashboard/components/Card';
import { PERIODS, rangeFor, type PeriodId } from '@/features/dashboard/periods';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useWallets } from '@/features/wallets/hooks/useWallets';
import { transactionsApi, type Transaction, type TransactionFilters, type TransactionType } from './api/transactions.api';
import { TransactionFormModal } from './components/TransactionFormModal';
import { useTransactions } from './hooks/useTransactions';
import { groupByDay, totalsOf } from './summary';
import styles from './TransactionsPage.module.css';

type PeriodFilter = PeriodId | 'all';

const typeLabel = (type: TransactionType): string => t(`transactions.type.${type}`);

const KIND: Record<TransactionType, 'income' | 'expense' | 'neutral'> = {
    INCOME: 'income',
    OPENING_BALANCE: 'income',
    EXPENSE: 'expense',
    TRANSFER: 'neutral',
    ADJUSTMENT: 'neutral',
};

const ICON = { income: <ArrowUpIcon size={16} />, expense: <ArrowDownIcon size={16} />, neutral: <SwapIcon size={16} /> };

const dayHeading = () => new Intl.DateTimeFormat(intlTag(), { weekday: 'long', day: '2-digit', month: 'long', timeZone: 'UTC' });

/** Nome exibido de uma transação: a descrição (traduzida se automática) ou, na falta, a categoria. */
const txName = (tx: Transaction): string => descriptionLabel(tx.description.trim()) || categoryLabel(tx.category.name);

export function TransactionsPage() {
    const toast = useToast();
    const [period, setPeriod] = useState<PeriodFilter>('this-month');
    const [type, setType] = useState<TransactionType | ''>('');
    const [walletId, setWalletId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [creating, setCreating] = useState(false);
    const [toDelete, setToDelete] = useState<Transaction | null>(null);
    const [deleting, setDeleting] = useState(false);

    const filters = useMemo<TransactionFilters>(
        () => ({
            ...(period !== 'all' ? rangeFor(period) : {}),
            ...(type ? { type } : {}),
            ...(walletId ? { walletId } : {}),
            ...(categoryId ? { categoryId } : {}),
        }),
        [period, type, walletId, categoryId],
    );

    const { state, reload } = useTransactions(filters);
    const wallets = useWallets();
    const categories = useCategories();

    const walletList = wallets.state.status === 'ready' ? wallets.state.data : [];
    const categoryList = categories.state.status === 'ready' ? categories.state.data : [];
    const filtered = Boolean(type || walletId || categoryId || period !== 'this-month');

    async function confirmDelete(tx: Transaction) {
        setDeleting(true);
        try {
            await transactionsApi.remove(tx.id);
            toast(t('transactions.toast.deleted'));
            reload();
            wallets.reload();
        } catch (error) {
            toast(apiErrorMessage(error), 'danger');
        } finally {
            setDeleting(false);
            setToDelete(null);
        }
    }

    function handleSaved() {
        setCreating(false);
        toast(t('transactions.toast.created'));
        reload();
        wallets.reload();
    }

    function clearFilters() {
        setPeriod('this-month');
        setType('');
        setWalletId('');
        setCategoryId('');
    }

    const newButton = (
        <Button onClick={() => setCreating(true)} data-tour="new-transaction">
            <PlusIcon size={18} /> {t('transactions.new')}
        </Button>
    );

    return (
        <>
            <PageHeader eyebrow={t('transactions.eyebrow')} title={t('transactions.title')} actions={newButton} />

            <Card className={styles.filters} tour="tx-filters">
                <SelectField
                    label={t('transactions.filters.period')}
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
                    options={[...PERIODS.map((p) => ({ value: p.id, label: p.label })), { value: 'all', label: t('transactions.filters.allPeriod') }]}
                />
                <SelectField
                    label={t('transactions.filters.type')}
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType | '')}
                    placeholder={t('transactions.filters.allTypes')}
                    options={(['INCOME', 'EXPENSE', 'TRANSFER', 'OPENING_BALANCE', 'ADJUSTMENT'] as const).map((id) => ({
                        value: id,
                        label: typeLabel(id),
                    }))}
                />
                <SelectField
                    label={t('transactions.filters.wallet')}
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    placeholder={t('transactions.filters.all')}
                    options={walletList.map((w) => ({ value: w.id, label: w.name }))}
                />
                <SelectField
                    label={t('transactions.filters.category')}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    placeholder={t('transactions.filters.all')}
                    options={categoryList.map((c) => ({ value: c.id, label: categoryLabel(c.name) }))}
                />
            </Card>

            {state.status === 'loading' && (
                <div className={styles.skeletons}>
                    <Skeleton height={90} radius="var(--radius-xl)" />
                    <Skeleton height={320} radius="var(--radius-xl)" />
                </div>
            )}

            {state.status === 'error' && (
                <div className={styles.error}>
                    <Alert tone="danger">{state.message}</Alert>
                    <Button variant="ghost" onClick={reload}>
                        {t('transactions.retry')}
                    </Button>
                </div>
            )}

            {state.status === 'ready' && (
                <div className={styles.content} aria-busy={state.refreshing}>
                    <Summary items={state.data} />

                    <Card tour="tx-list">
                        {state.data.length === 0 ? (
                            <EmptyState
                                icon={<ListIcon size={26} />}
                                title={filtered ? t('transactions.empty.filteredTitle') : t('transactions.empty.title')}
                                action={
                                    filtered ? (
                                        <Button variant="ghost" onClick={clearFilters}>
                                            {t('transactions.filters.clear')}
                                        </Button>
                                    ) : (
                                        newButton
                                    )
                                }
                            >
                                {filtered ? t('transactions.empty.filteredBody') : t('transactions.empty.body')}
                            </EmptyState>
                        ) : (
                            groupByDay(state.data).map((group) => (
                                <section key={group.day} className={styles.group}>
                                    <h2 className={styles.day}>{dayHeading().format(new Date(`${group.day}T12:00:00Z`))}</h2>
                                    <ul className={styles.list}>
                                        {group.items.map((tx) => (
                                            <Row key={tx.id} tx={tx} onDelete={() => setToDelete(tx)} />
                                        ))}
                                    </ul>
                                </section>
                            ))
                        )}
                    </Card>
                </div>
            )}

            {creating && (
                <TransactionFormModal
                    wallets={walletList}
                    categories={categoryList}
                    onCreateCategory={categories.create}
                    onClose={() => setCreating(false)}
                    onSaved={handleSaved}
                />
            )}

            {toDelete && (
                <ConfirmDialog
                    title={t('transactions.delete.title')}
                    confirmLabel={t('transactions.delete')}
                    loading={deleting}
                    onCancel={() => setToDelete(null)}
                    onConfirm={() => void confirmDelete(toDelete)}
                >
                    {t('transactions.delete.bodyA')}
                    <strong>{txName(toDelete)}</strong>
                    {t('transactions.delete.bodyB', { amount: formatCurrency(toDelete.amount) })}
                    <strong>{toDelete.wallet.name}</strong>
                    {t('transactions.delete.bodyC')}
                </ConfirmDialog>
            )}
        </>
    );
}

function Summary({ items }: { items: Transaction[] }) {
    const totals = totalsOf(items);
    return (
        <dl className={styles.summary} data-tour="tx-summary">
            <div>
                <dt>{t('transactions.summary.income')}</dt>
                <dd className={styles.income}>{formatCurrency(totals.income)}</dd>
            </div>
            <div>
                <dt>{t('transactions.summary.expenses')}</dt>
                <dd className={styles.expense}>{formatCurrency(totals.expenses)}</dd>
            </div>
            <div>
                <dt>{t('transactions.summary.result')}</dt>
                <dd>{totals.result < 0 ? `-${formatCurrency(-totals.result)}` : formatCurrency(totals.result)}</dd>
            </div>
        </dl>
    );
}

function Row({ tx, onDelete }: { tx: Transaction; onDelete: () => void }) {
    const kind = KIND[tx.type];
    const sign = kind === 'income' ? '+' : kind === 'expense' ? '-' : '';
    const deletable = tx.type === 'INCOME' || tx.type === 'EXPENSE';

    return (
        <li className={styles.row} data-tour="tx-row">
            <span className={`${styles.icon} ${styles[`icon_${kind}`]}`}>{ICON[kind]}</span>
            <div className={styles.info}>
                <strong>{txName(tx)}</strong>
                <span>
                    {typeLabel(tx.type)} · {categoryLabel(tx.category.name)} · {tx.wallet.name} · {formatDayMonth(tx.date)}
                </span>
            </div>
            <span className={`${styles.amount} ${styles[kind]}`}>
                {sign}
                {formatCurrency(tx.amount)}
            </span>
            {deletable ? (
                <button type="button" className={styles.delete} onClick={onDelete} data-tour="tx-delete" aria-label={t('transactions.deleteNamed', { name: txName(tx) })} title={t('transactions.delete')}>
                    <TrashIcon size={17} />
                </button>
            ) : (
                <span className={styles.deleteSpace} />
            )}
        </li>
    );
}
