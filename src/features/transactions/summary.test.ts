import { describe, expect, it } from 'vitest';
import type { Transaction } from './api/transactions.api';
import { groupByDay, totalsOf } from './summary';

const tx = (id: string, type: Transaction['type'], amount: string, date: string): Transaction => ({
    id,
    type,
    amount,
    date,
    description: id,
    category: { id: 'c', name: 'Outros' },
    wallet: { id: 'w', name: 'Conta' },
});

describe('totalsOf', () => {
    it('soma só receitas e despesas; transferências, saldo inicial e ajustes ficam de fora', () => {
        const items = [
            tx('a', 'INCOME', '1000.00', '2025-03-01T10:00:00Z'),
            tx('b', 'EXPENSE', '250.50', '2025-03-02T10:00:00Z'),
            tx('c', 'TRANSFER', '999.00', '2025-03-02T11:00:00Z'),
            tx('d', 'OPENING_BALANCE', '5000.00', '2025-03-01T00:00:00Z'),
            tx('e', 'ADJUSTMENT', '10.00', '2025-03-03T00:00:00Z'),
        ];

        expect(totalsOf(items)).toEqual({ income: 1000, expenses: 250.5, result: 749.5 });
    });

    it('lista vazia zera tudo', () => {
        expect(totalsOf([])).toEqual({ income: 0, expenses: 0, result: 0 });
    });
});

describe('groupByDay', () => {
    it('agrupa pelo dia (UTC), do mais recente para o mais antigo', () => {
        const groups = groupByDay([
            tx('velha', 'EXPENSE', '1.00', '2025-03-01T23:59:00Z'),
            tx('nova', 'EXPENSE', '1.00', '2025-03-03T00:01:00Z'),
            tx('mesmo-dia', 'INCOME', '1.00', '2025-03-01T08:00:00Z'),
        ]);

        expect(groups.map((g) => g.day)).toEqual(['2025-03-03', '2025-03-01']);
        expect(groups[1]!.items.map((i) => i.id)).toEqual(['velha', 'mesmo-dia']);
    });
});
