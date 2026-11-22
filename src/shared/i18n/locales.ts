export type Locale = 'pt' | 'en';

export type LocaleInfo = {
    id: Locale;
    /** Nome do idioma escrito no próprio idioma (é o que aparece no seletor). */
    name: string;
    /** Tag BCP 47 usada em Intl (datas, números, moeda). */
    tag: string;
};

/** Para adicionar um idioma: crie as versões nos arquivos de `messages/`, registre aqui e em `messages/index.ts`. */
export const LOCALES: LocaleInfo[] = [
    { id: 'pt', name: 'Português', tag: 'pt-BR' },
    { id: 'en', name: 'English', tag: 'en-US' },
];

export const DEFAULT_LOCALE: Locale = 'pt';

export const isLocale = (value: unknown): value is Locale => LOCALES.some((l) => l.id === value);
