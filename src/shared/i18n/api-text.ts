import { ApiError, NetworkError } from '@/shared/api/api-error';
import { formatCurrency } from '@/shared/format/format';
import { t, tOr } from './i18n';

/**
 * Tudo o que nasce na API chega aqui para ser exibido no idioma atual: mensagens de erro (pelo
 * código, nunca pelo texto em inglês da API), categorias do sistema, descrições automáticas e avisos.
 * Se nada casar, o texto original é mantido.
 */

/** Traduz qualquer erro de chamada à API para uma mensagem amigável. */
export function apiErrorMessage(error: unknown, fallbackKey: 'api.fallback' | 'api.unexpected' = 'api.fallback'): string {
    if (error instanceof NetworkError) return t('api.network');
    if (error instanceof ApiError) {
        const byCode = tOr(`error.${error.code}`, '');
        if (byCode) return byCode;
        const http = /^HTTP_(\d+)$/.exec(error.code)?.[1];
        const byHttp = http ? tOr(`api.http${http}`, '') : '';
        if (byHttp) return byHttp;
        return error.status >= 500 ? t('api.server') : t(fallbackKey);
    }
    return t('api.unexpected');
}

type CategoryKey =
    | 'category.transfer' | 'category.openingBalance' | 'category.adjustment'
    | 'category.food' | 'category.transportation' | 'category.housing' | 'category.health' | 'category.education'
    | 'category.entertainment' | 'category.shopping' | 'category.bills' | 'category.other';

// Nomes (em qualquer idioma) → chave. Cobre as categorias do sistema e as 9 criadas para todo usuário.
const SYSTEM_CATEGORIES: Record<string, CategoryKey> = {
    transfer: 'category.transfer', transferência: 'category.transfer', transferencia: 'category.transfer',
    'opening balance': 'category.openingBalance', 'saldo inicial': 'category.openingBalance',
    adjustment: 'category.adjustment', ajuste: 'category.adjustment',
    alimentação: 'category.food', alimentacao: 'category.food', food: 'category.food',
    transporte: 'category.transportation', transportation: 'category.transportation', transport: 'category.transportation',
    moradia: 'category.housing', housing: 'category.housing',
    saúde: 'category.health', saude: 'category.health', health: 'category.health',
    educação: 'category.education', educacao: 'category.education', education: 'category.education',
    lazer: 'category.entertainment', entertainment: 'category.entertainment', leisure: 'category.entertainment',
    compras: 'category.shopping', shopping: 'category.shopping',
    contas: 'category.bills', bills: 'category.bills',
    outros: 'category.other', other: 'category.other', others: 'category.other',
};

/** Categorias do sistema e as padrão são traduzidas; as criadas pelo usuário ficam como foram escritas. */
export function categoryLabel(name: string): string {
    const key = SYSTEM_CATEGORIES[name.trim().toLowerCase()];
    return key ? t(key) : name;
}

const AUTO_DESCRIPTIONS: Record<string, 'description.transfer' | 'description.openingBalance'> = {
    transferência: 'description.transfer',
    transferencia: 'description.transfer',
    transfer: 'description.transfer',
    'saldo inicial': 'description.openingBalance',
    'opening balance': 'description.openingBalance',
};

/** Descrições geradas pelo sistema ("Saldo inicial", "Transferência") no idioma atual; as digitadas pelo usuário não mudam. */
export function descriptionLabel(description: string): string {
    const key = AUTO_DESCRIPTIONS[description.trim().toLowerCase()];
    return key ? t(key) : description;
}

type NotificationLike = { type: string; title: string; message: string };

// A API grava o aviso em português: Você atingiu a meta "Nome" (R$ 8000.00).
const GOAL_REACHED = /"(.+)"\s*\(R\$\s*([^)]+)\)/;

/** Título e mensagem de uma notificação no idioma atual (o tipo decide o modelo; o texto original é o plano B). */
export function notificationText(n: NotificationLike): { title: string; message: string } {
    const title = tOr(`notification.${n.type}.title`, n.title);

    if (n.type === 'GOAL_REACHED') {
        const found = GOAL_REACHED.exec(n.message);
        if (found) {
            const raw = found[2]!.trim();
            // a API envia "8000.00"; textos antigos podem vir como "8.000,00"
            const value = Number(raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw);
            const amount = Number.isFinite(value) ? formatCurrency(value) : `R$ ${raw}`;
            return { title, message: t('notification.GOAL_REACHED.message', { goal: found[1]!, amount }) };
        }
    }
    return { title, message: n.message };
}
