import type { CurrentUser, Plan } from '@/features/auth/api/auth.api';
import { TUTORIAL_ORDER } from '@/features/tutorial';

const FEATURES: Record<Plan, string[]> = {
    FREE: [],
    PLUS: ['TRANSFERS', 'CATEGORY_ANALYSIS'],
    PRO: ['TRANSFERS', 'CATEGORY_ANALYSIS', 'GOALS', 'NOTIFICATIONS'],
};

/** Usuário logado no plano pedido. Por padrão já viu todos os tutoriais, para o tour não abrir sozinho nos testes. */
export function userOn(plan: Plan, overrides: Partial<CurrentUser> = {}): CurrentUser {
    return {
        id: 'u1',
        name: 'Ana Souza',
        username: 'ana',
        plan,
        features: FEATURES[plan],
        seenTutorials: [...TUTORIAL_ORDER],
        ...overrides,
    };
}

export const wallets = {
    conta: { id: 'w-conta', name: 'Conta corrente', balance: '1500.00' },
    poupanca: { id: 'w-poup', name: 'Poupança', balance: '300.00' },
};

export const categories = [
    { id: 'c-food', name: 'Alimentação' },
    { id: 'c-rent', name: 'Moradia' },
];
