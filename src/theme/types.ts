/**
 * Contrato de um tema. Componentes nunca usam cores diretas: leem só os
 * tokens semânticos abaixo (via variáveis CSS). Para criar um tema novo basta
 * implementar `Theme` — nenhum componente precisa mudar.
 */
export type Theme = {
    id: string;
    label: string;
    /** Informa ao navegador (scrollbars, inputs nativos). */
    colorScheme: 'dark' | 'light';
    color: {
        bg: {
            app: string;
            surface: string;
            surfaceRaised: string;
            input: string;
            sidebar: string;
        };
        border: { subtle: string; strong: string; focus: string };
        text: {
            primary: string;
            secondary: string;
            muted: string;
            onBrand: string;
            onAccent: string;
        };
        brand: { primary: string; primaryHover: string; soft: string };
        /** `text` é a versão legível sobre superfícies (links, percentuais). */
        accent: { primary: string; soft: string; text: string };
        status: {
            danger: string;
            dangerSoft: string;
            success: string;
            successSoft: string;
        };
    };
    /** Cores de séries em gráficos (ordem de uso). */
    chart: { series: [string, string, string, string, string]; grid: string };
    gradient: { brand: string; card: string; page: string };
    shadow: { card: string; raised: string; focus: string };
    radius: { sm: string; md: string; lg: string; xl: string; pill: string };
    font: { body: string; heading: string };
};
