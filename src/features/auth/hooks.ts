import { useAuth } from './context/AuthContext';

/** O plano do usuário inclui esta feature? (ver Tabela 28 do documento) */
export function useHasFeature(feature: 'TRANSFERS' | 'CATEGORY_ANALYSIS' | 'GOALS' | 'NOTIFICATIONS'): boolean {
    const { user } = useAuth();
    return user?.features.includes(feature) ?? false;
}
