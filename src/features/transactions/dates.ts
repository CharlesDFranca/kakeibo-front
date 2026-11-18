import { toDateOnly } from '@/features/dashboard/periods';

/**
 * Converte o dia escolhido (YYYY-MM-DD) no instante enviado à API.
 * Hoje usa o instante atual (a API não aceita datas futuras);
 * dias anteriores usam meio-dia UTC para não "mudar de dia" ao exibir.
 */
export function dateInputToIso(day: string, now: Date = new Date()): string {
    if (day === toDateOnly(now)) return now.toISOString();
    return `${day}T12:00:00.000Z`;
}
