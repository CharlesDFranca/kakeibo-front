/**
 * Dados fictícios do tutorial. Enquanto o tour está aberto, as telas buscam tudo aqui
 * (ver `setDemoResolver`), então abrem na hora e sempre há exemplos para mostrar,
 * mesmo para quem ainda não criou carteiras, transações ou metas.
 */
import { t } from '@/shared/i18n';

const DAY = 86_400_000;
const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * DAY).toISOString();
const ymd = (daysAgo: number) => iso(daysAgo).slice(0, 10);

/** Os textos dependem do idioma: os dados são montados a cada tour, não uma vez só. */
function buildData() {
    const wallets = [
        { id: 'demo-w1', name: t('tutorial.demo.0'), balance: '4820.35' },
        { id: 'demo-w2', name: t('tutorial.demo.1'), balance: '12500.00' },
        { id: 'demo-w3', name: t('tutorial.demo.2'), balance: '236.90' },
    ];

    const tx = (id: string, description: string, amount: string, daysAgo: number, type: string, category: string, wallet = 0) => ({
        id,
        description,
        amount,
        date: iso(daysAgo),
        type,
        category: { id: `demo-c-${category}`, name: category },
        wallet: wallets[wallet]!,
    });

    const transactions = [
        tx('demo-t1', t('tutorial.demo.3'), '5400.00', 1, 'INCOME', t('tutorial.demo.3')),
        tx('demo-t2', t('tutorial.demo.4'), '286.40', 1, 'EXPENSE', t('tutorial.demo.10')),
        tx('demo-t3', t('tutorial.demo.5'), '1650.00', 3, 'EXPENSE', t('tutorial.demo.11')),
        tx('demo-t4', t('tutorial.demo.6'), '800.00', 4, 'TRANSFER', t('tutorial.demo.6'), 1),
        tx('demo-t5', t('tutorial.demo.7'), '58.00', 6, 'EXPENSE', t('tutorial.demo.12'), 2),
        tx('demo-t6', t('tutorial.demo.8'), '174.90', 8, 'EXPENSE', t('tutorial.demo.13')),
        tx('demo-t7', t('tutorial.demo.9'), '950.00', 10, 'INCOME', t('tutorial.demo.14')),
    ];

    const evolution = Array.from({ length: 30 }, (_, i) => ({
        date: ymd(29 - i),
        income: i % 9 === 0 ? '2400.00' : '0.00',
        expenses: (60 + ((i * 37) % 180)).toFixed(2),
        balance: (3200 + i * 55 + Math.sin(i / 3) * 380).toFixed(2),
    }));

    const goals = [
        { id: 'demo-g1', name: t('tutorial.demo.15'), status: 'IN PROGRESS', currentAmount: '3200.00', targetAmount: '8000.00', deadline: new Date(Date.now() + 160 * DAY).toISOString() },
        { id: 'demo-g2', name: t('tutorial.demo.16'), status: 'IN PROGRESS', currentAmount: '9100.00', targetAmount: '12000.00', deadline: null },
        { id: 'demo-g3', name: t('tutorial.demo.17'), status: 'COMPLETED', currentAmount: '6500.00', targetAmount: '6500.00', deadline: null },
    ];

    const movement = (id: string, type: string, amount: string, walletId: string, daysAgo: number, extra: object = {}) => ({
        id, type, amount, walletId, revertedDepositId: null, reverted: false, createdAt: iso(daysAgo), ...extra,
    });

    const movements = [
        movement('demo-m1', 'DEPOSIT', '1200.00', 'demo-w1', 20),
        movement('demo-m2', 'DEPOSIT', '1500.00', 'demo-w2', 12),
        movement('demo-m3', 'DEPOSIT', '500.00', 'demo-w1', 7, { reverted: true }),
        movement('demo-m4', 'WITHDRAW', '500.00', 'demo-w1', 6, { revertedDepositId: 'demo-m3' }),
        movement('demo-m5', 'DEPOSIT', '500.00', 'demo-w1', 2),
    ];

    const transfers = [
        { id: 'demo-tr1', amount: '800.00', status: 'COMPLETED', sourceWallet: wallets[1], destinationWallet: wallets[0], createdAt: iso(4), updatedAt: iso(4) },
        { id: 'demo-tr2', amount: '150.00', status: 'REVERTED', sourceWallet: wallets[0], destinationWallet: wallets[2], createdAt: iso(9), updatedAt: iso(8) },
    ];

    const notifications = [
        { id: 'demo-n1', type: 'GOAL_REACHED', title: 'Meta atingida!', message: 'Você atingiu a meta "Notebook novo".', read: false, createdAt: iso(1) },
        { id: 'demo-n2', type: 'GOAL_REACHED', title: 'Meta atingida!', message: 'Você atingiu a meta "Bicicleta".', read: true, createdAt: iso(30) },
    ];

    const categories = [t('tutorial.demo.10'), t('tutorial.demo.11'), t('tutorial.demo.12'), t('tutorial.demo.13'), t('tutorial.demo.3'), t('tutorial.demo.14')].map((name) => ({
        id: `demo-c-${name}`, name, isSystem: false, isActive: true,
    }));

    const summaryOf = (g: (typeof goals)[number]) => ({
        id: g.id,
        name: g.name,
        currentAmount: g.currentAmount,
        targetAmount: g.targetAmount,
        percentage: Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100),
        deadline: g.deadline,
    });

    return { wallets, tx, transactions, evolution, goals, movements, transfers, notifications, categories, summaryOf };
}

/** `canAnalyze`: o plano do usuário inclui a análise por categoria (senão o card some, como na tela real). */
export function createDemoResolver(options: { canAnalyze: boolean }) {
    const { wallets, transactions, evolution, goals, movements, transfers, notifications, categories, summaryOf } = buildData();

    return (fullPath: string, method: string): unknown => {
        if (method !== 'GET') return method === 'POST' ? { id: 'demo' } : undefined;

        const path = fullPath.replace(/^\/+/, '/').split('?')[0]!;
        const withQuery = fullPath;

        if (path === '/finance/dashboard') {
            return {
                balance: { current: '17557.25', income: '8750.00', expenses: '3114.75' },
                financialEvolution: evolution,
                expensesByCategory: options.canAnalyze
                    ? [
                          { categoryId: 'a', categoryName: t('tutorial.demo.11'), amount: '1650.00', percentage: 53 },
                          { categoryId: 'b', categoryName: t('tutorial.demo.10'), amount: '716.40', percentage: 23 },
                          { categoryId: 'c', categoryName: t('tutorial.demo.13'), amount: '374.90', percentage: 12 },
                          { categoryId: 'd', categoryName: t('tutorial.demo.12'), amount: '224.00', percentage: 7 },
                          { categoryId: 'e', categoryName: t('tutorial.demo.19'), amount: '149.45', percentage: 5 },
                      ]
                    : null,
                recentTransactions: transactions.slice(0, 5),
            };
        }
        if (path === '/planning/dashboard') return goals.slice(0, 2).map(summaryOf);
        if (path === '/wallets') return wallets;
        if (path === '/categories') return categories;
        if (path === '/transactions') return transactions;
        if (path === '/transfers') {
            const status = /[?&]status=(\w+)/.exec(withQuery)?.[1];
            return status ? transfers.filter((t) => t.status === status) : transfers;
        }
        if (path === '/goals') return { goals };
        if (path.startsWith('/goals/')) {
            const goal = goals.find((g) => path === `/goals/${g.id}`) ?? goals[0]!;
            return { goalId: goal.id, ...goal, movements };
        }
        if (path === '/notifications') {
            return /unread=true/.test(withQuery) ? notifications.filter((n) => !n.read) : notifications;
        }
        return undefined;
    };
}
