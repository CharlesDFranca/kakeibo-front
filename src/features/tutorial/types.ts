import type { ReactNode } from 'react';
import type { FeatureKey } from '@/features/plans/plans';

/**
 * Como achar o elemento que o passo destaca:
 * - string: seletor CSS (quase sempre `[data-tour="..."]`);
 * - { field }: campo de formulário dentro do modal aberto, pelo texto do rótulo;
 * - { sel, text }: o primeiro elemento de `sel` cujo texto começa com `text`.
 */
export type Target = string | { field: string } | { sel: string; text: string };
export type TargetSpec = Target | Target[];

export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export type ScreenId = 'dashboard' | 'wallets' | 'transactions' | 'transfers' | 'goals' | 'goal' | 'notifications' | 'plans' | 'profile';

export type Screen = {
    id: ScreenId;
    label: string;
    icon: ReactNode;
    /** Tela onde esse tutorial aparece (e para onde "Rever" leva). */
    route: string;
    /** Recurso de plano necessário; sem ele a tela vira um único passo de aviso. */
    feature?: FeatureKey;
    minPlan?: 'Plus' | 'Pro';
    /** Tela que só faz sentido com o recurso: some inteira se o plano não tiver. */
    hideWhenLocked?: boolean;
};

export type TourStep = {
    id: string;
    screen: ScreenId;
    /** Rota aberta antes do passo. A meta de exemplo é '/metas/demo-g1'. */
    route?: string;
    /** Sem alvo, o passo é uma caixa central (resumo da tela). */
    target?: TargetSpec;
    placement?: Placement;
    title: string;
    text: string;
    /** Passo que acontece dentro de um modal: o tutorial clica em `opener` e mantém o modal aberto nos passos com a mesma `key`. */
    modal?: { key: string; opener: TargetSpec };
    /** Pula o passo quando o elemento não existe (ex.: lista vazia). */
    optional?: boolean;
    /** Abre o menu lateral (com os nomes) durante o passo. */
    nav?: boolean;
    /** Preenchido ao montar a lista: o plano do usuário não inclui esta tela. */
    locked?: boolean;
    minPlan?: 'Plus' | 'Pro';
};
