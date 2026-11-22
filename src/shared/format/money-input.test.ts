import { describe, expect, it } from 'vitest';
import { parseMoneyInput } from './money-input';

describe('parseMoneyInput', () => {
    it.each([
        ['49,90', '49.90'],
        ['1.234,56', '1234.56'],
        ['1,234.56', '1234.56'],
        ['10', '10.00'],
        ['10,5', '10.50'],
        ['10.50', '10.50'],
        ['1.234.567', '1234567.00'],
        ['R$ 99,90', '99.90'],
        ['0,05', '0.05'],
        ['007', '7.00'],
    ])('converte "%s" em "%s"', (raw, expected) => {
        expect(parseMoneyInput(raw)).toBe(expected);
    });

    it.each(['', '   ', 'abc', '1,234,56', '12.34.5', '1.2345', '10,999', '-5', '1e3'])('recusa "%s"', (raw) => {
        expect(parseMoneyInput(raw)).toBeNull();
    });
});
