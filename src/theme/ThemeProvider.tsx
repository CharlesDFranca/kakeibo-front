import {
    createContext,
    useCallback,
    useContext,
    useLayoutEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { applyTheme } from './applyTheme';
import { DEFAULT_THEME_ID, themes } from './themes';
import type { Theme } from './types';

const STORAGE_KEY = 'kakeibo:theme';

type ThemeContextValue = {
    theme: Theme;
    themes: Theme[];
    setThemeId: (id: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredId(): string {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && themes[stored]) return stored;
        if (stored === 'prisma') return 'vinho'; // o Prisma foi substituído pelo Vinho
    } catch {
        /* storage indisponível: usa o padrão */
    }
    return DEFAULT_THEME_ID;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeId, setId] = useState(readStoredId);
    const theme = themes[themeId] ?? themes[DEFAULT_THEME_ID]!;

    useLayoutEffect(() => applyTheme(theme), [theme]);

    const setThemeId = useCallback((id: string) => {
        if (!themes[id]) return;
        setId(id);
        try {
            localStorage.setItem(STORAGE_KEY, id);
        } catch {
            /* ignora */
        }
    }, []);

    const value = useMemo(
        () => ({ theme, themes: Object.values(themes), setThemeId }),
        [theme, setThemeId],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
    return ctx;
}
