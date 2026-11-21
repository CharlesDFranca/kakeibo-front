import { intlTag } from '@/shared/i18n/i18n';

// Os formatadores dependem do idioma atual; ficam em cache por idioma (a tela é remontada ao trocar).
const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();
function nf(options: Intl.NumberFormatOptions): Intl.NumberFormat {
    const key = `n|${intlTag()}|${JSON.stringify(options)}`;
    let f = cache.get(key);
    if (!f) cache.set(key, (f = new Intl.NumberFormat(intlTag(), options)));
    return f as Intl.NumberFormat;
}
function df(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = `d|${intlTag()}|${JSON.stringify(options)}`;
    let f = cache.get(key);
    if (!f) cache.set(key, (f = new Intl.DateTimeFormat(intlTag(), options)));
    return f as Intl.DateTimeFormat;
}

/** "1234.50" -> "R$ 1.234,50" / "R$1,234.50" (a API envia valores como texto; a moeda é sempre real). */
export function formatCurrency(amount: string | number): string {
    return nf({ style: 'currency', currency: 'BRL' }).format(Number(amount));
}

/** Versão curta para eixos e rótulos: "R$ 1,2 mil". */
export function formatCompactCurrency(amount: number): string {
    return nf({ style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(amount);
}

// A API trabalha com datas em UTC; formatar em UTC evita "voltar um dia".
export const formatDayMonth = (iso: string) => df({ day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(new Date(iso));
export const formatDate = (iso: string) => df({ day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso));

// Prazos de meta são escolhidos como dia local; mostrar no fuso do usuário.
export const formatLocalDate = (iso: string) => df({ day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Dias inteiros até a data (0 se já passou). */
export function daysUntil(iso: string, now: Date = new Date()): number {
    return Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / MS_PER_DAY));
}

export function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '')).toUpperCase() || '?';
}
