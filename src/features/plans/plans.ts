import { t } from '@/shared/i18n';
import type { Plan } from '@/features/auth/api/auth.api';

export type FeatureKey = 'TRANSFERS' | 'CATEGORY_ANALYSIS' | 'GOALS' | 'NOTIFICATIONS';

/**
 * Espelho da Tabela 28 do documento, só para exibição.
 * Quem libera de verdade é a API (`user.features`); aqui nunca se decide acesso.
 */
export const PLAN_ORDER: Plan[] = ['FREE', 'PLUS', 'PRO'];

/** Textos resolvidos na leitura (getters), então seguem o idioma atual; o uso `PLAN_INFO[plan].tagline` continua igual. */
export const PLAN_INFO: Record<Plan, { label: string; tagline: string; features: FeatureKey[] }> = {
    FREE: {
        label: 'Free',
        get tagline() {
            return t('plans.tagline.free');
        },
        features: [],
    },
    PLUS: {
        label: 'Plus',
        get tagline() {
            return t('plans.tagline.plus');
        },
        features: ['TRANSFERS', 'CATEGORY_ANALYSIS'],
    },
    PRO: {
        label: 'Pro',
        get tagline() {
            return t('plans.tagline.pro');
        },
        features: ['TRANSFERS', 'CATEGORY_ANALYSIS', 'GOALS', 'NOTIFICATIONS'],
    },
};

export const FEATURE_LABEL: Record<FeatureKey, string> = {
    get TRANSFERS() {
        return t('plans.feature.TRANSFERS');
    },
    get CATEGORY_ANALYSIS() {
        return t('plans.feature.CATEGORY_ANALYSIS');
    },
    get GOALS() {
        return t('plans.feature.GOALS');
    },
    get NOTIFICATIONS() {
        return t('plans.feature.NOTIFICATIONS');
    },
};

/** Itens que todo plano inclui. */
export const baseFeatures = (): string[] => [t('plans.base.wallets'), t('plans.base.categories'), t('plans.base.dashboard')];

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
