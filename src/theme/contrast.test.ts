import { describe, expect, it } from 'vitest';
import { themes } from './themes';

// Cores no formato do projeto: #hex, rgb()/rgba() e color-mix(in srgb, A p%, B).
type Rgba = [number, number, number, number];

function splitTop(text: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let current = '';
    for (const ch of text) {
        if (ch === '(') depth++;
        if (ch === ')') depth--;
        if (ch === ',' && depth === 0) {
            out.push(current.trim());
            current = '';
        } else current += ch;
    }
    out.push(current.trim());
    return out;
}

function parse(input: string): Rgba {
    const c = input.trim();
    if (c === 'transparent') return [0, 0, 0, 0];
    if (c.startsWith('#')) {
        const h = c.length === 4 ? [...c.slice(1)].map((x) => x + x).join('') : c.slice(1);
        return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1) as Rgba;
    }
    const rgb = /^rgba?\((.*)\)$/.exec(c);
    if (rgb) {
        const p = rgb[1]!.split(',').map(Number);
        return [p[0]!, p[1]!, p[2]!, p[3] ?? 1];
    }
    const mix = /^color-mix\((.*)\)$/.exec(c);
    if (mix) {
        const [, a = '', b = ''] = splitTop(mix[1]!);
        const am = /^(.*)\s+([\d.]+)%$/.exec(a)!;
        const bm = /^(.*)\s+([\d.]+)%$/.exec(b);
        const first = parse(am[1]!);
        const second = parse(bm ? bm[1]! : b);
        const wa = (Number(am[2]) / 100) * first[3];
        const wb = (1 - Number(am[2]) / 100) * second[3];
        const alpha = wa + wb;
        if (alpha === 0) return [0, 0, 0, 0];
        return [0, 1, 2].map((i) => (wa * first[i]! + wb * second[i]!) / alpha).concat(alpha) as Rgba;
    }
    throw new Error(`Cor não reconhecida: ${input}`);
}

/** Cor translúcida `fg` sobre o fundo opaco `bg`. */
const over = (fg: Rgba, bg: Rgba): Rgba => [0, 1, 2].map((i) => fg[i]! * fg[3] + bg[i]! * (1 - fg[3])).concat(1) as Rgba;

function luminance([r, g, b]: Rgba): number {
    const f = (v: number) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** Razão de contraste da WCAG (1 a 21). */
function ratio(a: Rgba, b: Rgba): number {
    const [x, y] = [luminance(a), luminance(b)];
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

describe.each(Object.values(themes).map((theme) => [theme.id, theme] as const))('contraste do tema %s', (_id, theme) => {
    // WCAG AA (4,5:1) em todos; o alto contraste segue o nível AAA (7:1), como pede o eMAG.
    const MIN = theme.id === 'alto-contraste' ? 7 : 4.5;
    const BORDER = theme.id === 'alto-contraste' ? 3 : 1.6;
    const c = theme.color;
    const P = parse;
    const surfaces = { app: P(c.bg.app), surface: P(c.bg.surface), raised: P(c.bg.surfaceRaised), input: P(c.bg.input) };

    function failures(): string[] {
        const found: string[] = [];
        const check = (name: string, fg: Rgba, bg: Rgba, min = MIN) => {
            const r = ratio(fg, bg);
            if (r < min) found.push(`${name}: ${r.toFixed(2)} (mínimo ${min})`);
        };

        for (const [name, bg] of Object.entries(surfaces)) {
            check(`texto principal / ${name}`, P(c.text.primary), bg);
            check(`texto secundário / ${name}`, P(c.text.secondary), bg);
            check(`texto discreto / ${name}`, P(c.text.muted), bg);
            check(`texto de destaque / ${name}`, P(c.accent.text), bg);
            check(`perigo / ${name}`, P(c.status.danger), bg);
            check(`sucesso / ${name}`, P(c.status.success), bg);
        }

        const sidebar = P(c.bg.sidebar);
        check('perigo / fundo suave', P(c.status.danger), over(P(c.status.dangerSoft), surfaces.surface));
        check('sucesso / fundo suave', P(c.status.success), over(P(c.status.successSoft), surfaces.surface));
        check('destaque / fundo suave', P(c.accent.text), over(P(c.accent.soft), surfaces.surface));
        check('texto sobre a marca / menu lateral', P(c.text.onBrand), sidebar);
        check('texto sobre a marca / marca', P(c.text.onBrand), P(c.brand.primary));
        check('texto sobre a marca / marca (hover)', P(c.text.onBrand), P(c.brand.primaryHover));
        check('item do menu (85%) / menu lateral', over([...P(c.text.onBrand).slice(0, 3), 0.85] as Rgba, sidebar), sidebar);
        const gradientEnd = /\s(\S.*?)\s100%\)/.exec(theme.gradient.brand);
        if (gradientEnd) check('texto sobre a marca / fim do degradê', P(c.text.onBrand), P(gradientEnd[1]!));
        check('texto sobre o destaque / destaque', P(c.text.onAccent), P(c.accent.primary));
        check('texto principal / marca suave', P(c.text.primary), over(P(c.brand.soft), surfaces.surface));

        // elementos que não são texto: 3:1 (foco) e o mínimo de cada tema (bordas e gráficos)
        check('foco / superfície', P(c.border.focus), surfaces.surface, 3);
        check('borda forte / superfície', over(P(c.border.strong), surfaces.surface), surfaces.surface, BORDER);
        theme.chart.series.forEach((s, i) => check(`gráfico, série ${i}`, P(s), surfaces.surface, i === 0 ? 3 : 1.5));
        return found;
    }

    it('todos os pares de cor atendem ao contraste mínimo', () => {
        expect(failures()).toEqual([]);
    });
});

describe('temas', () => {
    it('o tema padrão e o de alto contraste existem', () => {
        expect(themes['dark']).toBeDefined();
        expect(themes['alto-contraste']).toBeDefined();
    });
});
