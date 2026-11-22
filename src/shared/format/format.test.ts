import { describe, expect, it } from 'vitest';
import { setCurrentLocale } from '@/shared/i18n/i18n';
import { daysUntil, formatCurrency, formatDayMonth, initials } from './format';

describe('formatCurrency', () => {
    it('usa o padrão brasileiro em português', () => {
        expect(formatCurrency('1234.5')).toMatch(/^R\$\s1\.234,50$/);
    });

    it('troca separadores em inglês, mas a moeda continua sendo o real', () => {
        setCurrentLocale('en');
        expect(formatCurrency('1234.5')).toMatch(/^R\$\s?1,234\.50$/);
    });

    it('aceita número e texto', () => {
        expect(formatCurrency(10)).toBe(formatCurrency('10'));
    });
});

describe('formatDayMonth', () => {
    it('formata em UTC, sem "voltar um dia" no fuso do usuário', () => {
        expect(formatDayMonth('2025-03-05T00:30:00.000Z')).toBe('05/03');
    });
});

describe('daysUntil', () => {
    const now = new Date('2025-01-10T12:00:00Z');

    it('conta dias inteiros, arredondando para cima', () => {
        expect(daysUntil('2025-01-13T12:00:00Z', now)).toBe(3);
        expect(daysUntil('2025-01-13T18:00:00Z', now)).toBe(4);
    });

    it('nunca devolve negativo', () => {
        expect(daysUntil('2024-12-01T00:00:00Z', now)).toBe(0);
    });
});

describe('initials', () => {
    it.each([
        ['Ana Souza', 'AS'],
        ['ana', 'A'],
        ['  maria  da  silva ', 'MS'],
        ['', '?'],
    ])('"%s" → %s', (name, expected) => {
        expect(initials(name)).toBe(expected);
    });
});
