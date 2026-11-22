import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './locales';
import { MESSAGES, type MessageKey } from './messages';

const STORAGE_KEY = 'kakeibo:locale';

/** Idioma salvo; sem escolha anterior, usa o do navegador se for suportado. */
function detect(): Locale {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (isLocale(stored)) return stored;
    } catch {
        /* storage indisponível */
    }
    const prefix = (typeof navigator !== 'undefined' ? navigator.language : '').slice(0, 2).toLowerCase();
    return isLocale(prefix) ? prefix : DEFAULT_LOCALE;
}

let current: Locale = detect();

export const getLocale = (): Locale => current;

export function setCurrentLocale(locale: Locale): void {
    current = locale;
    try {
        localStorage.setItem(STORAGE_KEY, locale);
    } catch {
        /* sem persistência */
    }
}

/** Tag BCP 47 do idioma atual (pt-BR, en-US), usada por Intl. */
export const intlTag = (): string => LOCALES.find((l) => l.id === current)?.tag ?? 'pt-BR';

function fill(text: string, params?: Record<string, string | number>): string {
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`));
}

/**
 * Tradução por chave. Se a chave faltar no idioma atual, cai no português
 * (nunca mostra a chave crua). `{nome}` é substituído pelos parâmetros.
 */
export function t(key: MessageKey, params?: Record<string, string | number>): string {
    return fill(MESSAGES[current][key] ?? MESSAGES.pt[key] ?? key, params);
}

/** Plural simples: usa `<chave>.one` quando n é 1 e `<chave>.other` nos demais casos. `{n}` já vem preenchido. */
export function tn(key: string, n: number, params?: Record<string, string | number>): string {
    return t(`${key}.${n === 1 ? 'one' : 'other'}` as MessageKey, { n, ...params });
}

/** Traduz se existir; devolve o texto original quando não há tradução (códigos novos, por exemplo). */
export function tOr(key: string, fallback: string): string {
    return (MESSAGES[current] as Record<string, string>)[key] ?? (MESSAGES.pt as Record<string, string>)[key] ?? fallback;
}
