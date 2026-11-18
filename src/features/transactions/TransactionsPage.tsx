import { useMemo, useState } from 'react';
import { apiErrorMessage } from '@/shared/api/error-messages';
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

const TYPE_LABEL: Record<TransactionType, string> = {
    INCOME: 'Receita',
    EXPENSE: 'Despesa',
    TRANSFER: 'Transferência',
    OPENING_BALANCE: 'Saldo inicial',
    ADJUSTMENT: 'Ajuste',
};

const KIND: Record<TransactionType, 'income' | 'expense' | 'neutral'> = {
    INCOME: 'income',
    OPENING_BALANCE: 'income',
    EXPENSE: 'expense',
    TRANSFER: 'neutral',
    ADJUSTMENT: 'neutral',
};

const ICON = { income: <ArrowUpIcon size={16} />, expense: <ArrowDownIcon size={16} />, neutral: <SwapIcon size={16} /> };

const dayHeading = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', timeZone: 'UTC' });

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
            toast('Transação excluída.');
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
        toast('Transação registrada.');
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
        <Button onClick={() => setCreating(true)}>
            <PlusIcon size={18} /> Nova transação
        </Button>
    );

    return (
        <>
            <PageHeader eyebrow="Movimentações" title="Transações" actions={newButton} />

            <Card className={styles.filters}>
                <SelectField
                    label="Período"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
                    options={[...PERIODS.map((p) => ({ value: p.id, label: p.label })), { value: 'all', label: 'Todo o período' }]}
                />
                <SelectField
                    label="Tipo"
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType | '')}
                    placeholder="Todos"
                    options={(['INCOME', 'EXPENSE', 'TRANSFER', 'OPENING_BALANCE', 'ADJUSTMENT'] as const).map((t) => ({
                        value: t,
                        label: TYPE_LABEL[t],
                    }))}
                />
                <SelectField
                    label="Carteira"
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    placeholder="Todas"
                    options={walletList.map((w) => ({ value: w.id, label: w.name }))}
                />
                <SelectField
                    label="Categoria"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    placeholder="Todas"
                    options={categoryList.map((c) => ({ value: c.id, label: c.name }))}
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
                        Tentar novamente
                    </Button>
                </div>
            )}

            {state.status === 'ready' && (
                <div className={styles.content} aria-busy={state.refreshing}>
                    <Summary items={state.data} />

                    <Card>
                        {state.data.length === 0 ? (
                            <EmptyState
                                icon={<ListIcon size={26} />}
                                title={filtered ? 'Nada encontrado com esses filtros' : 'Nenhuma transação neste período'}
                                action={
                                    filtered ? (
                                        <Button variant="ghost" onClick={clearFilters}>
                                            Limpar filtros
                                        </Button>
                                    ) : (
                                        newButton
                                    )
                                }
                            >
                                {filtered ? 'Tente ampliar o período ou remover algum filtro.' : 'Registre receitas e despesas para acompanhar seu dinheiro.'}
                            </EmptyState>
                        ) : (
                            groupByDay(state.data).map((group) => (
                                <section key={group.day} className={styles.group}>
                                    <h2 className={styles.day}>{dayHeading.format(new Date(`${group.day}T12:00:00Z`))}</h2>
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
                    title="Excluir transação"
                    confirmLabel="Excluir"
                    loading={deleting}
                    onCancel={() => setToDelete(null)}
                    onConfirm={() => void confirmDelete(toDelete)}
                >
                    Excluir <strong>{toDelete.description.trim() || toDelete.category.name}</strong> ({formatCurrency(toDelete.amount)})? O saldo da carteira{' '}
                    <strong>{toDelete.wallet.name}</strong> será ajustado.
                </ConfirmDialog>
            )}
        </>
    );
}

function Summary({ items }: { items: Transaction[] }) {
    const totals = totalsOf(items);
    return (
        <dl className={styles.summary}>
            <div>
                <dt>Receitas</dt>
                <dd className={styles.income}>{formatCurrency(totals.income)}</dd>
            </div>
            <div>
                <dt>Despesas</dt>
                <dd className={styles.expense}>{formatCurrency(totals.expenses)}</dd>
            </div>
            <div>
                <dt>Resultado</dt>
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
        <li className={styles.row}>
            <span className={`${styles.icon} ${styles[`icon_${kind}`]}`}>{ICON[kind]}</span>
            <div className={styles.info}>
                <strong>{tx.description.trim() || tx.category.name}</strong>
                <span>
                    {TYPE_LABEL[tx.type]} · {tx.category.name} · {tx.wallet.name} · {formatDayMonth(tx.date)}
                </span>
            </div>
            <span className={`${styles.amount} ${styles[kind]}`}>
                {sign}
                {formatCurrency(tx.amount)}
            </span>
            {deletable ? (
                <button type="button" className={styles.delete} onClick={onDelete} aria-label={`Excluir ${tx.description || tx.category.name}`} title="Excluir">
                    <TrashIcon size={17} />
                </button>
            ) : (
                <span className={styles.deleteSpace} />
            )}
        </li>
    );
}
