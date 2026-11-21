import type { Theme } from '../types';

/** `pct`% de `a` misturado com `b`. */
export const mix = (a: string, b: string, pct: number) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;

const FONT = "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";

/** Decisões de cor de um tema; o resto (bordas, gradientes, gráficos) é derivado. */
export type ThemeSpec = {
    id: string;
    label: string;
    scheme: 'dark' | 'light';
    app: string;
    surface: string;
    raised: string;
    input: string;
    sidebar: string;
    text: string;
    onBrand: string;
    brand: string;
    brandHover: string;
    /** Fim do degradê do destaque principal (o início é `brand`). */
    brandEnd: string;
    accent: string;
    accentText: string;
    onAccent: string;
    danger: string;
    success: string;
    series: [string, string, string, string, string];
};

export function buildTheme(s: ThemeSpec): Theme {
    const dark = s.scheme === 'dark';
    return {
        id: s.id,
        label: s.label,
        colorScheme: s.scheme,
        color: {
            bg: { app: s.app, surface: s.surface, surfaceRaised: s.raised, input: s.input, sidebar: s.sidebar },
            border: {
                subtle: mix(s.text, 'transparent', dark ? 12 : 13),
                strong: mix(s.text, 'transparent', dark ? 26 : 28),
                focus: s.accentText,
            },
            text: {
                primary: s.text,
                secondary: mix(s.text, s.surface, dark ? 78 : 76),
                muted: mix(s.text, s.surface, dark ? 64 : 72),
                onBrand: s.onBrand,
                onAccent: s.onAccent,
            },
            brand: { primary: s.brand, primaryHover: s.brandHover, soft: mix(s.brand, 'transparent', dark ? 35 : 14) },
            accent: { primary: s.accent, soft: mix(s.accentText, 'transparent', 16), text: s.accentText },
            status: {
                danger: s.danger,
                dangerSoft: mix(s.danger, 'transparent', 15),
                success: s.success,
                successSoft: mix(s.success, 'transparent', 16),
            },
        },
        chart: { series: s.series, grid: mix(s.text, 'transparent', 10) },
        gradient: {
            brand: `linear-gradient(135deg, ${s.brand} 0%, ${s.brandEnd} 100%)`,
            card: `linear-gradient(160deg, ${s.surface} 0%, ${s.surface} 100%)`,
            page: `radial-gradient(1200px 600px at 12% -10%, ${mix(s.brand, 'transparent', dark ? 30 : 10)} 0%, transparent 60%), radial-gradient(900px 500px at 100% 110%, ${mix(s.accent, 'transparent', dark ? 10 : 14)} 0%, transparent 60%)`,
        },
        shadow: dark
            ? {
                  card: '0 24px 60px -24px rgba(0, 0, 0, 0.55)',
                  raised: '0 12px 30px -12px rgba(0, 0, 0, 0.5)',
                  focus: `0 0 0 3px ${mix(s.accentText, 'transparent', 30)}`,
              }
            : {
                  card: '0 1px 2px rgba(16, 24, 40, 0.06), 0 14px 32px -18px rgba(16, 24, 40, 0.22)',
                  raised: '0 10px 24px -12px rgba(16, 24, 40, 0.28)',
                  focus: `0 0 0 3px ${mix(s.accentText, 'transparent', 30)}`,
              },
        radius: { sm: '0.625rem', md: '0.875rem', lg: '1.25rem', xl: '1.75rem', pill: '999px' },
        font: { body: FONT, heading: FONT },
    };
}
