import type { Goal, GoalStatus } from './api/goals.api';

export const STATUS_LABEL: Record<GoalStatus, string> = {
    'IN PROGRESS': 'Em andamento',
    COMPLETED: 'Concluída',
    EXPIRED: 'Expirada',
    CANCELLED: 'Cancelada',
};

export const STATUS_FILTERS: { value: GoalStatus | ''; label: string }[] = [
    { value: '', label: 'Todas' },
    { value: 'IN PROGRESS', label: 'Em andamento' },
    { value: 'COMPLETED', label: 'Concluídas' },
    { value: 'EXPIRED', label: 'Expiradas' },
    { value: 'CANCELLED', label: 'Canceladas' },
];

/** Percentual 0–100 do valor-alvo já alcançado. */
export function progressOf(goal: Pick<Goal, 'currentAmount' | 'targetAmount'>): number {
    const target = Number(goal.targetAmount);
    if (target <= 0) return 0;
    return Math.min(100, Math.round((Number(goal.currentAmount) / target) * 100));
}

/** Quanto falta para o valor-alvo (nunca negativo). */
export function remainingOf(goal: Pick<Goal, 'currentAmount' | 'targetAmount'>): number {
    return Math.max(0, Number(goal.targetAmount) - Number(goal.currentAmount));
}

/** Dia local de amanhã (YYYY-MM-DD): o prazo mínimo aceito pela API é 1 dia à frente. */
export function tomorrowDateOnly(now: Date = new Date()): string {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
}

/** Prazo escolhido (dia local) vira o fim desse dia, em ISO. */
export function deadlineToIso(day: string): string {
    const [y, m, d] = day.split('-').map(Number) as [number, number, number];
    return new Date(y, m - 1, d, 23, 59, 59).toISOString();
}
