import { describe, expect, it } from 'vitest';
import { dateInputToIso } from './dates';

describe('dateInputToIso', () => {
    it('hoje usa o instante atual (a API recusa data futura)', () => {
        const now = new Date(2025, 2, 15, 9, 30);
        expect(dateInputToIso('2025-03-15', now)).toBe(now.toISOString());
    });

    it('dias anteriores usam meio-dia UTC, para não mudar de dia ao exibir', () => {
        expect(dateInputToIso('2025-03-10', new Date(2025, 2, 15))).toBe('2025-03-10T12:00:00.000Z');
    });
});
