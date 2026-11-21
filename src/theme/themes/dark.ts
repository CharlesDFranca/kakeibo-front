import { kakeiboPalette as p } from '../palettes/kakeibo';
import type { Theme } from '../types';

/**
 * Tema escuro baseado na referência visual (painel roxo, cartões arredondados).
 * Tons intermediários são derivados da paleta com color-mix().
 */
const mix = (a: string, b: string, pctOfA: number) =>
    `color-mix(in srgb, ${a} ${pctOfA}%, ${b})`;

export const darkTheme: Theme = {
    id: 'dark',
    label: 'Ameixa',
    colorScheme: 'dark',
    color: {
        bg: {
            app: p.navy,
            surface: mix(p.purple, p.navy, 14),
            surfaceRaised: mix(p.purple, p.navy, 26),
            input: mix(p.navy, '#000000', 80),
            sidebar: p.purple,
        },
        border: {
            subtle: mix(p.mauve, 'transparent', 12),
            strong: mix(p.mauve, 'transparent', 28),
            focus: p.teal,
        },
        text: {
            primary: p.ice,
            secondary: mix(p.ice, p.navy, 78),
            muted: mix(p.mauve, p.navy, 72),
            onBrand: p.ice,
            onAccent: p.navy,
        },
        brand: {
            primary: p.purple,
            primaryHover: mix(p.purple, p.ice, 82),
            soft: mix(p.purple, 'transparent', 35),
        },
        accent: {
            primary: p.teal,
            soft: mix(p.teal, 'transparent', 16),
            text: p.teal,
        },
        status: {
            // Cores de estado não fazem parte da paleta da marca.
            danger: '#FF9BAE',
            dangerSoft: 'rgba(255, 155, 174, 0.14)',
            success: p.teal,
            successSoft: mix(p.teal, 'transparent', 16),
        },
    },
    chart: {
        series: [
            p.teal,
            p.mauve,
            mix(p.purple, p.ice, 70),
            mix(p.teal, p.purple, 55),
            mix(p.mauve, p.purple, 50),
        ],
        grid: mix(p.mauve, 'transparent', 10),
    },
    gradient: {
        brand: `linear-gradient(135deg, ${p.purple} 0%, ${mix(p.purple, p.navy, 55)} 100%)`,
        card: `linear-gradient(160deg, ${mix(p.purple, p.navy, 30)} 0%, ${mix(p.purple, p.navy, 12)} 100%)`,
        page: `radial-gradient(1200px 600px at 12% -10%, ${mix(p.purple, 'transparent', 38)} 0%, transparent 60%), radial-gradient(900px 500px at 100% 110%, ${mix(p.teal, 'transparent', 10)} 0%, transparent 60%)`,
    },
    shadow: {
        card: '0 24px 60px -24px rgba(0, 0, 0, 0.55)',
        raised: '0 12px 30px -12px rgba(0, 0, 0, 0.5)',
        focus: `0 0 0 3px ${mix(p.teal, 'transparent', 28)}`,
    },
    radius: { sm: '10px', md: '14px', lg: '20px', xl: '28px', pill: '999px' },
    font: {
        body: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
        heading:
            "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
};
