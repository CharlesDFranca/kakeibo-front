import type { Theme } from './types';

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** { color: { bg: { app } } } -> { '--color-bg-app': ... } */
function flatten(
    value: unknown,
    path: string[] = [],
    out: Record<string, string> = {},
): Record<string, string> {
    if (typeof value === 'string') {
        out[`--${path.map(kebab).join('-')}`] = value;
    } else if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) {
            flatten(child, [...path, key], out);
        }
    }
    return out;
}

export function themeToCssVariables(theme: Theme): Record<string, string> {
    const { id: _id, label: _label, colorScheme: _cs, ...tokens } = theme;
    return flatten(tokens);
}

/** Escreve os tokens como variáveis CSS no elemento raiz. */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement) {
    for (const [name, value] of Object.entries(themeToCssVariables(theme))) {
        root.style.setProperty(name, value);
    }
    root.style.colorScheme = theme.colorScheme;
    root.dataset.theme = theme.id;
}
