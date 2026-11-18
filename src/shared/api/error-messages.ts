import { ApiError, NetworkError } from './api-error';

/** Mensagens em português para os códigos de erro da API. */
const BY_CODE: Record<string, string> = {
    // autenticação
    INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
    EMAIL_ALREADY_EXISTS: 'Já existe uma conta com este e-mail.',
    USERNAME_ALREADY_EXISTS: 'Este nome de usuário já está em uso.',
    INVALID_EMAIL: 'Informe um e-mail válido.',
    INVALID_USERNAME: 'Nome de usuário inválido.',
    PASSWORD_CANNOT_BE_EMPTY: 'Informe uma senha.',
    INVALID_SESSION: 'Sua sessão expirou. Entre novamente.',
    // carteiras
    WALLET_ALREADY_EXISTS: 'Você já tem uma carteira com este nome.',
    WALLET_NOT_FOUND: 'Carteira não encontrada.',
    WALLET_HAS_ALLOCATED_MONEY:
        'Esta carteira tem dinheiro alocado em metas. Estorne os aportes antes de excluí-la.',
    // categorias
    CATEGORY_ALREADY_EXISTS: 'Já existe uma categoria com este nome.',
    CATEGORY_NOT_FOUND: 'Categoria não encontrada.',
    // transações
    INSUFFICIENT_WALLET_BALANCE: 'Saldo insuficiente na carteira.',
    AMOUNT_MUST_BE_GREATER_THAN_ZERO: 'O valor precisa ser maior que zero.',
    INVALID_TRANSACTION_DATE: 'Data da transação inválida.',
    INVALID_DATE_RANGE: 'Período inválido.',
    TRANSACTION_NOT_FOUND: 'Transação não encontrada.',
    TRANSACTION_LINKED_TO_GOAL:
        'Esta transação pertence a uma meta. Estorne o aporte na própria meta.',
    TRANSACTION_CANNOT_BE_DELETED: 'Esta transação não pode ser excluída.',
    TRANSACTION_TYPE_NOT_ALLOWED: 'Tipo de transação não permitido.',
    // transferências
    TRANSFER_SAME_WALLET: 'Escolha carteiras diferentes para origem e destino.',
    TRANSFER_NOT_FOUND: 'Transferência não encontrada.',
    TRANSFER_CANNOT_BE_REVERTED: 'Esta transferência não pode ser revertida (já foi revertida).',
    // metas
    GOAL_NOT_FOUND: 'Meta não encontrada.',
    GOAL_ALREADY_EXISTS: 'Você já tem uma meta com este nome.',
    GOAL_MUST_BE_IN_PROGRESS: 'A meta precisa estar em andamento para esta operação.',
    INSUFFICIENT_GOAL_BALANCE: 'A meta não tem saldo suficiente para esta operação.',
    GOAL_EXPIRED_CANNOT_RECEIVE_DEPOSIT: 'Esta meta expirou e não recebe aportes. Reative-a com um novo prazo.',
    EXPIRED_GOAL_CANNOT_BE_COMPLETED: 'Esta meta expirou. Reative-a com um novo prazo.',
    ONLY_EXPIRED_GOALS_CAN_BE_REACTIVATED: 'Só metas expiradas podem ser reativadas.',
    GOAL_CURRENT_AMOUNT_CANNOT_EXCEED_TARGET: 'O aporte ultrapassa o valor-alvo da meta.',
    GOAL_DEADLINE_CANNOT_ALREADY_BE_EXPIRED: 'O prazo precisa ser uma data futura.',
    GOAL_DEADLINE_MUST_BE_AT_LEAST_ONE_DAY_AFTER_CREATION: 'O prazo precisa ser de pelo menos 1 dia a partir de agora.',
    GOAL_MOVEMENT_AMOUNT_MUST_BE_GREATER_THAN_ZERO: 'O valor do aporte precisa ser maior que zero.',
    GOAL_MOVEMENT_REFERENCES_NON_EXISTENT_WALLET: 'A carteira deste aporte não existe mais.',
    GOAL_DEPOSIT_NOT_FOUND: 'Aporte não encontrado.',
    GOAL_DEPOSIT_ALREADY_REVERTED: 'Este aporte já foi estornado.',
    GOAL_MOVEMENT_CANNOT_BE_REVERTED: 'Esta movimentação não pode ser estornada.',
    GOAL_ALREADY_CANCELLED: 'Esta meta já foi cancelada.',
    // valores e nomes
    MONEY_VALUE_CANNOT_BE_NEGATIVE: 'O valor não pode ser negativo.',
    MONEY_CANNOT_HAVE_MORE_THAN_TWO_DECIMAL_PLACES: 'Use no máximo duas casas decimais.',
    NAME_CANNOT_BE_EMPTY: 'Informe um nome.',
    NAME_CANNOT_EXCEED_MAXIMUM_LENGTH: 'O nome pode ter no máximo 100 caracteres.',
    // planos
    FEATURE_NOT_AVAILABLE_IN_PLAN: 'Este recurso não está disponível no seu plano.',
};

/** Traduz qualquer erro de chamada à API para uma mensagem amigável. */
export function apiErrorMessage(error: unknown, fallback = 'Não foi possível concluir a operação.'): string {
    if (error instanceof NetworkError) return error.message;
    if (error instanceof ApiError) {
        return (
            BY_CODE[error.code] ??
            (error.status >= 500 ? 'Erro no servidor. Tente novamente em instantes.' : fallback)
        );
    }
    return 'Erro inesperado. Tente novamente.';
}
