import { describe, expect, it } from 'vitest';
import { rangeFor, toDateOnly } from './periods';

describe('períodos do painel', () => {
    const now = new Date(2025, 2, 15, 10, 0); // 15/03/2025, horário local

    it('toDateOnly usa a data local com zeros à esquerda', () => {
        expect(toDateOnly(new Date(2025, 0, 5))).toBe('2025-01-05');
    });

    it.each([
        ['this-month', '2025-03-01', '2025-03-31'],
        ['last-month', '2025-02-01', '2025-02-28'],
        ['last-30-days', '2025-02-14', '2025-03-15'],
        ['this-year', '2025-01-01', '2025-12-31'],
    ] as const)('%s', (period, startDate, endDate) => {
        expect(rangeFor(period, now)).toEqual({ startDate, endDate });
    });
});
