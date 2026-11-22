import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { setCurrentLocale } from '@/shared/i18n/i18n';
import { buildSteps, SCREENS, TUTORIAL_ORDER, tutorialForPath } from './steps';

const PRO = ['TRANSFERS', 'CATEGORY_ANALYSIS', 'GOALS', 'NOTIFICATIONS'];
const SRC = join(process.cwd(), 'src');

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) return name === 'test' ? [] : sourceFiles(full);
        return /\.(tsx?|css)$/.test(name) && !/\.test\./.test(name) && name !== 'steps.tsx' ? [full] : [];
    });
}

describe('roteiro do tutorial', () => {
    it('cada tutorial da lista existe e tem passos', () => {
        const steps = buildSteps(PRO);
        for (const id of TUTORIAL_ORDER) {
            expect(SCREENS[id], id).toBeDefined();
            expect(steps.some((s) => s.screen === id), `sem passos: ${id}`).toBe(true);
        }
    });

    it('os ids dos passos são únicos', () => {
        const ids = buildSteps(PRO).map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('todo passo tem título e texto nos dois idiomas', () => {
        for (const locale of ['pt', 'en'] as const) {
            setCurrentLocale(locale);
            const empty = buildSteps(PRO).filter((s) => !s.title.trim() || !s.text.trim());
            expect(empty.map((s) => s.id), locale).toEqual([]);
        }
    });

    it('cada tela abre com um passo que traz a rota', () => {
        const steps = buildSteps(PRO);
        for (const id of TUTORIAL_ORDER) {
            const first = steps.find((s) => s.screen === id);
            expect(first?.route, `primeiro passo de ${id} sem rota`).toBeTruthy();
        }
    });

    it('o tutorial é curto: poucas caixas no total', () => {
        expect(buildSteps(PRO).length).toBeLessThanOrEqual(35);
    });

    it('só os destaques que existem no código: nenhum data-tour órfão após mexer nas telas', () => {
        const source = sourceFiles(SRC).map((f) => readFileSync(f, 'utf8')).join('\n');
        const wanted = new Set<string>();
        for (const step of buildSteps(PRO)) {
            for (const m of JSON.stringify([step.target, step.modal?.opener]).matchAll(/data-tour=\\"([\w-]+)\\"/g)) wanted.add(m[1]!);
        }
        const missing = [...wanted].filter((id) => !new RegExp(`["'\`]${id}["'\`]`).test(source));
        expect(missing).toEqual([]);
    });
});

describe('telas bloqueadas pelo plano', () => {
    it('no plano Free, transferências, metas e notificações viram uma única caixa de aviso', () => {
        const steps = buildSteps([]);
        for (const id of ['transfers', 'goals', 'notifications'] as const) {
            const own = steps.filter((s) => s.screen === id);
            expect(own, id).toHaveLength(1);
            expect(own[0]).toMatchObject({ locked: true, minPlan: SCREENS[id].minPlan });
        }
    });

    it('a meta de exemplo some inteira quando o plano não tem metas', () => {
        expect(buildSteps([]).some((s) => s.screen === 'goal')).toBe(false);
        expect(buildSteps(PRO).some((s) => s.screen === 'goal')).toBe(true);
    });

    it('com o recurso liberado, nada fica bloqueado', () => {
        expect(buildSteps(PRO).some((s) => s.locked)).toBe(false);
    });
});

describe('tutorialForPath', () => {
    it.each([
        ['/', 'dashboard'],
        ['/carteiras', 'wallets'],
        ['/transacoes', 'transactions'],
        ['/transferencias', 'transfers'],
        ['/metas', 'goals'],
        ['/metas/abc-123', 'goal'],
        ['/notificacoes', 'notifications'],
        ['/planos', 'plans'],
        ['/perfil', 'profile'],
    ])('%s → %s', (path, id) => {
        expect(tutorialForPath(path)).toBe(id);
    });

    it.each(['/login', '/cadastro', '/metas/abc/extra', '/qualquer'])('%s não tem tutorial', (path) => {
        expect(tutorialForPath(path)).toBeNull();
    });
});
