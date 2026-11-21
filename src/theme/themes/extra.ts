import {
    carmimPalette as c,
    lagoaPalette as l,
    musgoPalette as m,
    nevoaPalette as n,
    noturnoPalette as o,
    marePalette as r,
    vinhoPalette as v,
} from '../palettes/extra';
import { buildTheme, mix } from './factory';

const WHITE = '#FFFFFF';
const BLACK = '#000000';

// ───────────── escuros ─────────────

/** Vinho: ameixa e magenta sobre quase preto, com destaque em verde-menta claro. */
export const vinhoTheme = buildTheme({
    id: 'vinho',
    label: 'Vinho',
    scheme: 'dark',
    app: v.ink,
    surface: mix(v.grape, v.ink, 72),
    raised: v.grape,
    input: mix(v.ink, BLACK, 78),
    sidebar: v.plum,
    text: v.mint,
    onBrand: v.mint,
    brand: v.magenta,
    brandHover: mix(v.magenta, WHITE, 85),
    brandEnd: v.plum,
    accent: v.mint,
    accentText: v.mint,
    onAccent: v.ink,
    danger: '#FF9DB8',
    success: '#8FE3B8',
    series: [v.mint, mix(v.magenta, WHITE, 62), '#FFB4D6', '#8FE3B8', mix(v.plum, WHITE, 55)],
});

/** Tema 2: roxo quase preto com verde-azulado e verde-sálvia. */
export const lagoaTheme = buildTheme({
    id: 'lagoa',
    label: 'Lagoa',
    scheme: 'dark',
    app: l.ink,
    surface: mix(l.slate, l.ink, 22),
    raised: mix(l.slate, l.ink, 40),
    input: mix(l.ink, BLACK, 78),
    sidebar: l.slate,
    text: mix(l.yellow, WHITE, 9),
    onBrand: mix(l.yellow, WHITE, 9),
    brand: l.slate,
    brandHover: mix(l.slate, l.ink, 85),
    brandEnd: mix(l.slate, l.ink, 55),
    accent: l.teal,
    accentText: mix(l.teal, WHITE, 86),
    onAccent: l.ink,
    danger: '#F28B82',
    success: l.green,
    series: [l.teal, l.green, l.yellow, mix(l.slate, WHITE, 55), '#C9B6E4'],
});

/** Tema 3: azul-noite com lavanda. */
export const noturnoTheme = buildTheme({
    id: 'noturno',
    label: 'Noturno',
    scheme: 'dark',
    app: o.navy,
    surface: mix(o.indigo, o.navy, 70),
    raised: o.indigo,
    input: mix(o.navy, BLACK, 70),
    sidebar: o.graphite,
    text: o.white,
    onBrand: o.white,
    brand: o.indigo,
    brandHover: mix(o.indigo, o.lavender, 82),
    brandEnd: mix(o.indigo, o.navy, 45),
    accent: o.lavender,
    accentText: o.lavender,
    onAccent: o.navy,
    danger: '#FF9BB0',
    success: '#8FE0BF',
    series: [o.lavender, '#8FE0BF', '#7F9BFF', '#FFB4C2', '#F7DD72'],
});

// ───────────── claros ─────────────

/** Tema 4: cinza-névoa com azul-aço e menta. */
export const nevoaTheme = buildTheme({
    id: 'nevoa',
    label: 'Névoa',
    scheme: 'light',
    app: n.fog,
    surface: mix(WHITE, n.fog, 80),
    raised: mix(n.periwinkle, WHITE, 28),
    input: mix(WHITE, n.fog, 55),
    sidebar: n.steel,
    text: mix(n.steel, '#0A0F18', 28),
    onBrand: WHITE,
    brand: n.steel,
    brandHover: mix(n.steel, BLACK, 85),
    brandEnd: mix(n.steel, n.slate, 55),
    accent: n.mint,
    accentText: n.steel,
    onAccent: mix(n.steel, BLACK, 28),
    danger: '#A23030',
    success: '#17665A',
    series: [n.steel, n.mint, n.slate, n.periwinkle, '#2F8F83'],
});

/** Maré: creme com barra lateral azul-marinho, destaque turquesa e areia. */
export const mareTheme = buildTheme({
    id: 'mare',
    label: 'Maré',
    scheme: 'light',
    app: r.cream,
    surface: mix(WHITE, r.cream, 72),
    raised: mix(r.sage, WHITE, 38),
    input: mix(WHITE, r.cream, 55),
    sidebar: r.navy,
    text: r.navy,
    onBrand: r.cream,
    brand: r.navy,
    brandHover: mix(r.navy, BLACK, 85),
    brandEnd: mix(r.navy, r.teal, 72),
    accent: r.teal,
    accentText: mix(r.teal, r.navy, 38),
    onAccent: r.navy,
    danger: '#B2352F',
    success: mix(r.teal, r.navy, 38),
    series: [r.navy, r.teal, '#D9A36B', mix(r.sage, r.navy, 70), mix(r.teal, r.navy, 55)],
});

/** Tema 5: papel claro com barra lateral carmim. */
export const carmimTheme = buildTheme({
    id: 'carmim',
    label: 'Carmim',
    scheme: 'light',
    app: mix(c.mist, c.paper, 42),
    surface: c.paper,
    raised: mix(c.mist, c.paper, 55),
    input: mix(c.paper, WHITE, 60),
    sidebar: c.red,
    text: mix(c.red, '#0C0C10', 9),
    onBrand: c.paper,
    brand: c.red,
    brandHover: mix(c.red, BLACK, 85),
    brandEnd: mix(c.red, BLACK, 68),
    accent: c.sky,
    accentText: mix(c.teal, BLACK, 78),
    onAccent: '#14303F',
    danger: c.red,
    success: mix(c.teal, BLACK, 78),
    series: [c.red, c.teal, c.sky, mix(c.red, c.mist, 50), '#7A8699'],
});

/** Tema 6: tons de osso com barra lateral verde-musgo escuro. */
export const musgoTheme = buildTheme({
    id: 'musgo',
    label: 'Musgo',
    scheme: 'light',
    app: m.bone,
    surface: mix(m.bone, WHITE, 38),
    raised: mix(m.taupe, WHITE, 16),
    input: mix(m.bone, WHITE, 30),
    sidebar: m.ink,
    text: m.ink,
    onBrand: m.bone,
    brand: m.ink,
    brandHover: mix(m.ink, m.moss, 80),
    brandEnd: mix(m.ink, m.moss, 58),
    accent: m.sage,
    accentText: mix(m.moss, m.ink, 62),
    onAccent: m.ink,
    danger: '#A33826',
    success: mix(m.moss, m.ink, 62),
    series: [m.moss, m.sage, m.taupe, m.ink, '#C4B5A3'],
});

/**
 * Alto contraste (eMAG, padrão eGov): fundo preto, texto branco, links e destaques em amarelo,
 * bordas brancas e contraste mínimo de 7:1 nos textos. Não depende só de cor: bordas e
 * sublinhados reforçam a estrutura (ver `styles/high-contrast.css`).
 */
const hcBase = buildTheme({
    id: 'alto-contraste',
    label: 'Alto contraste',
    scheme: 'dark',
    app: '#000000',
    surface: '#000000',
    raised: '#0F0F0F',
    input: '#000000',
    sidebar: '#000000',
    text: '#FFFFFF',
    onBrand: '#FFFFFF',
    brand: '#000000',
    brandHover: '#1F1F1F',
    brandEnd: '#000000',
    accent: '#FFF333',
    accentText: '#FFF333',
    onAccent: '#000000',
    danger: '#FF9A9A',
    success: '#86FFB5',
    series: ['#FFF333', '#FFFFFF', '#86FFB5', '#7CCBFF', '#FF9A9A'],
});

export const altoContrasteTheme: Theme = {
    ...hcBase,
    color: {
        ...hcBase.color,
        border: { subtle: '#FFFFFF', strong: '#FFFFFF', focus: '#FFF333' },
        text: { ...hcBase.color.text, secondary: '#F2F2F2', muted: '#E0E0E0' },
        brand: { ...hcBase.color.brand, soft: 'rgba(255, 255, 255, 0.2)' },
        accent: { ...hcBase.color.accent, soft: 'rgba(255, 243, 51, 0.22)' },
        status: {
            ...hcBase.color.status,
            dangerSoft: 'rgba(255, 154, 154, 0.2)',
            successSoft: 'rgba(134, 255, 181, 0.2)',
        },
    },
    chart: { ...hcBase.chart, grid: 'rgba(255, 255, 255, 0.35)' },
    gradient: {
        brand: 'linear-gradient(#000000, #000000)',
        card: 'linear-gradient(#000000, #000000)',
        page: 'linear-gradient(#000000, #000000)',
    },
    shadow: {
        card: 'none',
        raised: 'none',
        focus: '0 0 0 3px #000000, 0 0 0 6px #FFF333',
    },
};
