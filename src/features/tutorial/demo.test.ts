import { describe, expect, it } from 'vitest';
import { setCurrentLocale } from '@/shared/i18n/i18n';
import { createDemoResolver } from './demo';

type Json = Record<string, unknown>;

describe('dados de exemplo do tutorial', () => {
    const demo = createDemoResolver({ canAnalyze: true });

    it('as listas das telas vêm preenchidas', () => {
        for (const path of ['/wallets', '/transactions', '/transfers', '/categories']) {
            const data = demo(path, 'GET') as unknown[];
            expect(Array.isArray(data) && data.length > 0, path).toBe(true);
        }
        expect((demo('/goals', 'GET') as { goals: unknown[] }).goals.length).toBeGreaterThan(0);
    });

    it('há uma meta de exemplo em andamento, para mostrar o aporte mesmo a quem não tem metas', () => {
        const { goals } = demo('/goals', 'GET') as { goals: { status: string }[] };
        expect(goals.some((g) => g.status === 'IN PROGRESS')).toBe(true);
    });

    it('o detalhe da meta de exemplo (/metas/demo-g1) traz o histórico', () => {
        const goal = demo('/goals/demo-g1', 'GET') as Json & { movements: unknown[] };
        expect(goal.goalId).toBe('demo-g1');
        expect(goal.movements.length).toBeGreaterThan(0);
    });

    it('o painel traz saldo, evolução e despesas por categoria', () => {
        const dash = demo('/finance/dashboard?startDate=2025-01-01', 'GET') as Json;
        expect(dash.balance).toBeDefined();
        expect(Array.isArray(dash.financialEvolution)).toBe(true);
        expect(Array.isArray(dash.expensesByCategory)).toBe(true);
    });

    it('sem a análise por categoria no plano, o card some, como na tela real', () => {
        const dash = createDemoResolver({ canAnalyze: false })('/finance/dashboard', 'GET') as Json;
        expect(dash.expensesByCategory).toBeNull();
    });

    it('filtra transferências por situação e notificações por não lidas', () => {
        const completed = demo('/transfers?status=COMPLETED', 'GET') as { status: string }[];
        expect(completed.length).toBeGreaterThan(0);
        expect(completed.every((tr) => tr.status === 'COMPLETED')).toBe(true);

        const unread = demo('/notifications?unread=true', 'GET') as { read: boolean }[];
        expect(unread.every((n) => !n.read)).toBe(true);
    });

    it('gravações não fazem nada: POST devolve um id de exemplo e o resto, nada', () => {
        expect(demo('/wallets', 'POST')).toEqual({ id: 'demo' });
        expect(demo('/wallets/x', 'DELETE')).toBeUndefined();
        expect(demo('/wallets/x', 'PATCH')).toBeUndefined();
    });

    it('os textos de exemplo seguem o idioma escolhido', () => {
        const pt = (createDemoResolver({ canAnalyze: true })('/wallets', 'GET') as { name: string }[]).map((w) => w.name);
        setCurrentLocale('en');
        const en = (createDemoResolver({ canAnalyze: true })('/wallets', 'GET') as { name: string }[]).map((w) => w.name);
        expect(en).not.toEqual(pt);
    });
});
