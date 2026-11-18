import type { Transaction } from './api/transactions.api';

export type Totals = { income: number; expenses: number; result: number };

/** Soma só receitas e despesas (transferências e ajustes não entram). */
export function totalsOf(items: Transaction[]): Totals {
    let income = 0;
    let expenses = 0;
    for (const t of items) {
        if (t.type === 'INCOME') income += Number(t.amount);
        else if (t.type === 'EXPENSE') expenses += Number(t.amount);
    }
    return { income, expenses, result: income - expenses };
}

/** Agrupa por dia (UTC), do mais recente para o mais antigo. */
export function groupByDay(items: Transaction[]): { day: string; items: Transaction[] }[] {
    const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
    const groups = new Map<string, Transaction[]>();
    for (const t of sorted) {
        const key = t.date.slice(0, 10);
        groups.set(key, [...(groups.get(key) ?? []), t]);
    }
    return [...groups].map(([day, list]) => ({ day, items: list }));
}
