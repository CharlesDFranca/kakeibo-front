import { describe, expect, it } from 'vitest';
import { deadlineToIso, progressOf, remainingOf, tomorrowDateOnly } from './status';

describe('progresso da meta', () => {
    it('percentual do valor-alvo, arredondado e limitado a 100', () => {
        expect(progressOf({ currentAmount: '500.00', targetAmount: '2000.00' })).toBe(25);
        expect(progressOf({ currentAmount: '333.33', targetAmount: '1000.00' })).toBe(33);
        expect(progressOf({ currentAmount: '3000.00', targetAmount: '2000.00' })).toBe(100);
        expect(progressOf({ currentAmount: '0', targetAmount: '0' })).toBe(0);
    });

    it('quanto falta nunca é negativo', () => {
        expect(remainingOf({ currentAmount: '500.00', targetAmount: '2000.00' })).toBe(1500);
        expect(remainingOf({ currentAmount: '2500.00', targetAmount: '2000.00' })).toBe(0);
    });
});

describe('prazo da meta', () => {
    it('o mínimo é amanhã, no dia local', () => {
        expect(tomorrowDateOnly(new Date(2025, 0, 31, 23, 30))).toBe('2025-02-01');
        expect(tomorrowDateOnly(new Date(2025, 11, 31, 8, 0))).toBe('2026-01-01');
    });

    it('o dia escolhido vira o fim daquele dia no fuso local', () => {
        const end = new Date(deadlineToIso('2025-06-10'));
        expect([end.getFullYear(), end.getMonth(), end.getDate(), end.getHours(), end.getMinutes()]).toEqual([2025, 5, 10, 23, 59]);
    });
});
