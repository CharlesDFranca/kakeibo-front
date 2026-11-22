import { describe, expect, it } from 'vitest';
import { getLocale, intlTag, setCurrentLocale, t, tn, tOr } from './i18n';
import { MESSAGES, type MessageKey } from './messages';

const keys = Object.keys(MESSAGES.pt) as MessageKey[];
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('t', () => {
    it('traduz e preenche os parâmetros', () => {
        expect(t('wallets.count.other', { n: 3 })).toBe('em 3 carteiras');
    });

    it('mantém {param} quando o parâmetro não é informado', () => {
        expect(t('wallets.count.other')).toBe('em {n} carteiras');
    });

    it('troca o texto ao mudar o idioma', () => {
        setCurrentLocale('en');
        expect(t('wallets.count.other', { n: 3 })).toBe('in 3 wallets');
        expect(getLocale()).toBe('en');
        expect(intlTag()).toBe('en-US');
    });

    it('guarda a escolha no navegador', () => {
        setCurrentLocale('en');
        expect(localStorage.getItem('kakeibo:locale')).toBe('en');
    });
});

describe('tn', () => {
    it('usa .one para 1 e .other para o resto', () => {
        expect(tn('wallets.count', 1)).toBe('em 1 carteira');
        expect(tn('wallets.count', 0)).toBe('em 0 carteiras');
        expect(tn('wallets.count', 2)).toBe('em 2 carteiras');
    });
});

describe('tOr', () => {
    it('devolve a tradução quando existe e o texto original quando não existe', () => {
        expect(tOr('app.close', 'x')).toBe('Fechar');
        expect(tOr('error.CODIGO_QUE_NAO_EXISTE', 'texto da API')).toBe('texto da API');
    });
});

describe('catálogo de mensagens', () => {
    it('português e inglês têm exatamente as mesmas chaves', () => {
        expect(Object.keys(MESSAGES.en).sort()).toEqual([...keys].sort());
    });

    it('nenhuma mensagem está vazia', () => {
        const empty = keys.filter((k) => !MESSAGES.pt[k].trim() || !MESSAGES.en[k].trim());
        expect(empty).toEqual([]);
    });

    it('os parâmetros {x} são os mesmos nos dois idiomas', () => {
        const mismatched = keys.filter((k) => placeholders(MESSAGES.pt[k]).join() !== placeholders(MESSAGES.en[k]).join());
        expect(mismatched).toEqual([]);
    });

    it('toda forma .one tem a .other correspondente (plural)', () => {
        const incomplete = keys.filter((k) => k.endsWith('.one') && !(`${k.slice(0, -4)}.other` in MESSAGES.pt));
        expect(incomplete).toEqual([]);
    });
});
