import { useAsyncData } from '@/shared/hooks/useAsyncData';
import { transactionsApi, type TransactionFilters } from '../api/transactions.api';

export function useTransactions(filters: TransactionFilters) {
    return useAsyncData(() => transactionsApi.list(filters), [
        filters.startDate,
        filters.endDate,
        filters.type,
        filters.walletId,
        filters.categoryId,
    ]);
}
