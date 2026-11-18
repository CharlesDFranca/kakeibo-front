const currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

/** "1234.50" -> "R$ 1.234,50" (a API envia valores como texto). */
export function formatCurrency(amount: string | number): string {
    return currency.format(Number(amount));
}

/** Versão curta para eixos e rótulos: "R$ 1,2 mil". */
export function formatCompactCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(amount);
}

// A API trabalha com datas em UTC; formatar em UTC evita "voltar um dia".
const day = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
const dayLong = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
});

// Prazos de meta são escolhidos como dia local; mostrar no fuso do usuário.
const localDay = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
export const formatLocalDate = (iso: string) => localDay.format(new Date(iso));

export const formatDayMonth = (iso: string) => day.format(new Date(iso));
export const formatDate = (iso: string) => dayLong.format(new Date(iso));

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Dias inteiros até a data (0 se já passou). */
export function daysUntil(iso: string, now: Date = new Date()): number {
    return Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / MS_PER_DAY));
}

export function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '')).toUpperCase() || '?';
}
