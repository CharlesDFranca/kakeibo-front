import {
    carmimPalette as c,
    lagoaPalette as l,
    musgoPalette as m,
    nevoaPalette as n,
    noturnoPalette as o,
    prismaPalette as p,
} from '../palettes/extra';
import { buildTheme, mix } from './factory';

const WHITE = '#FFFFFF';
const BLACK = '#000000';

// ───────────── escuros ─────────────

/** Tema 1: violeta profundo, destaque amarelo. */
export const prismaTheme = buildTheme({
    id: 'prisma',
    label: 'Prisma',
    scheme: 'dark',
    app: mix(p.violet, BLACK, 14),
    surface: mix(p.violet, BLACK, 26),
    raised: mix(p.violet, BLACK, 40),
    input: mix(p.violet, BLACK, 9),
    sidebar: p.violet,
    text: mix(p.yellow, WHITE, 8),
    onBrand: WHITE,
    brand: p.violet,
    brandHover: mix(p.violet, WHITE, 82),
    brandEnd: mix(p.violet, BLACK, 55),
    accent: p.yellow,
    accentText: p.yellow,
    onAccent: mix(p.violet, BLACK, 14),
    danger: mix(p.crimson, WHITE, 58),
    success: mix(p.blue, WHITE, 68),
    series: [p.yellow, p.orange, mix(p.crimson, WHITE, 70), mix(p.violet, WHITE, 62), p.blue],
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
    brandHover: mix(l.slate, WHITE, 82),
    brandEnd: mix(l.slate, l.ink, 55),
    accent: l.teal,
    accentText: l.teal,
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
    danger: '#B53A3A',
    success: '#1F7A6D',
    series: [n.steel, n.mint, n.slate, n.periwinkle, '#2F8F83'],
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
    accentText: mix(m.moss, m.ink, 78),
    onAccent: m.ink,
    danger: '#B2432F',
    success: mix(m.moss, m.ink, 78),
    series: [m.moss, m.sage, m.taupe, m.ink, '#C4B5A3'],
});
