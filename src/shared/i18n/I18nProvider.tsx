import { createContext, Fragment, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { getLocale, setCurrentLocale, t } from './i18n';
import { LOCALES, type Locale, type LocaleInfo } from './locales';

type I18nContextValue = {
    locale: Locale;
    locales: LocaleInfo[];
    setLocale: (locale: Locale) => void;
    t: typeof t;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Guarda o idioma e remonta as telas ao trocar (key). Assim, textos e formatadores
 * calculados fora do React (mensagens de erro, rótulos de status, datas) são
 * recalculados sem precisar de assinatura em cada componente.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setState] = useState<Locale>(getLocale);

    const setLocale = useCallback((next: Locale) => {
        setCurrentLocale(next);
        setState(next);
    }, []);

    const value = useMemo(() => ({ locale, locales: LOCALES, setLocale, t }), [locale, setLocale]);

    if (typeof document !== 'undefined') document.documentElement.lang = LOCALES.find((l) => l.id === locale)?.tag ?? locale;

    return (
        <I18nContext.Provider value={value}>
            <Fragment key={locale}>{children}</Fragment>
        </I18nContext.Provider>
    );
}

export function useI18n(): I18nContextValue {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n precisa estar dentro de <I18nProvider>');
    return ctx;
}
