import { t } from '@/shared/i18n';

export type PeriodId = 'this-month' | 'last-month' | 'last-30-days' | 'this-year';

export type DateRange = { startDate: string; endDate: string };

/** Opções de período no idioma atual (avaliado a cada chamada). */
export const periods = (): { id: PeriodId; label: string }[] => [
    { id: 'this-month', label: t('dashboard.period.thisMonth') },
    { id: 'last-month', label: t('dashboard.period.lastMonth') },
    { id: 'last-30-days', label: t('dashboard.period.last30Days') },
    { id: 'this-year', label: t('dashboard.period.thisYear') },
];

/** Compatibilidade: rótulos resolvidos na leitura, então seguem o idioma atual. */
export const PERIODS: { id: PeriodId; label: string }[] = (
    [
        ['this-month', 'dashboard.period.thisMonth'],
        ['last-month', 'dashboard.period.lastMonth'],
        ['last-30-days', 'dashboard.period.last30Days'],
        ['this-year', 'dashboard.period.thisYear'],
    ] as const
).map(([id, key]) => ({
    id,
    get label() {
        return t(key);
    },
}));

export const DEFAULT_PERIOD: PeriodId = 'this-month';

/** Data local como YYYY-MM-DD (a API interpreta o fim como o dia inteiro). */
export function toDateOnly(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function rangeFor(period: PeriodId, now: Date = new Date()): DateRange {
    const y = now.getFullYear();
    const m = now.getMonth();

    switch (period) {
        case 'this-month':
            return { startDate: toDateOnly(new Date(y, m, 1)), endDate: toDateOnly(new Date(y, m + 1, 0)) };
        case 'last-month':
            return { startDate: toDateOnly(new Date(y, m - 1, 1)), endDate: toDateOnly(new Date(y, m, 0)) };
        case 'last-30-days':
            return { startDate: toDateOnly(new Date(y, m, now.getDate() - 29)), endDate: toDateOnly(now) };
        case 'this-year':
            return { startDate: toDateOnly(new Date(y, 0, 1)), endDate: toDateOnly(new Date(y, 11, 31)) };
    }
}
