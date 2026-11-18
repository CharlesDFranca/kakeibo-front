import type { Plan } from '@/features/auth/api/auth.api';

export type FeatureKey = 'TRANSFERS' | 'CATEGORY_ANALYSIS' | 'GOALS' | 'NOTIFICATIONS';

/**
 * Espelho da Tabela 28 do documento, só para exibição.
 * Quem libera de verdade é a API (`user.features`); aqui nunca se decide acesso.
 */
export const PLAN_ORDER: Plan[] = ['FREE', 'PLUS', 'PRO'];

export const PLAN_INFO: Record<Plan, { label: string; tagline: string; features: FeatureKey[] }> = {
    FREE: { label: 'Free', tagline: 'O essencial para controlar seu dinheiro.', features: [] },
    PLUS: { label: 'Plus', tagline: 'Mais controle entre suas carteiras.', features: ['TRANSFERS', 'CATEGORY_ANALYSIS'] },
    PRO: { label: 'Pro', tagline: 'Planejamento completo, com metas e avisos.', features: ['TRANSFERS', 'CATEGORY_ANALYSIS', 'GOALS', 'NOTIFICATIONS'] },
};

export const FEATURE_LABEL: Record<FeatureKey, string> = {
    TRANSFERS: 'Transferências entre carteiras',
    CATEGORY_ANALYSIS: 'Análise de despesas por categoria',
    GOALS: 'Metas financeiras com aportes',
    NOTIFICATIONS: 'Notificações',
};

/** Itens que todo plano inclui. */
export const BASE_FEATURES = ['Carteiras e transações ilimitadas', 'Categorias personalizadas', 'Painel com evolução do saldo'];

export const FEATURE_KEYS: FeatureKey[] = ['TRANSFERS', 'CATEGORY_ANALYSIS', 'GOALS', 'NOTIFICATIONS'];

/** O que muda ao trocar de plano: recursos ganhos e perdidos. */
export function planDiff(from: Plan, to: Plan): { gained: FeatureKey[]; lost: FeatureKey[] } {
    const a = new Set(PLAN_INFO[from].features);
    const b = new Set(PLAN_INFO[to].features);
    return {
        gained: FEATURE_KEYS.filter((f) => b.has(f) && !a.has(f)),
        lost: FEATURE_KEYS.filter((f) => a.has(f) && !b.has(f)),
    };
}
