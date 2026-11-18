import { request } from '@/shared/api/http-client';
import type { TransactionType } from '@/features/dashboard/api/dashboard.api';

export type { TransactionType };

export type Transaction = {
    id: string;
    description: string;
    amount: string;
    date: string;
    type: TransactionType;
    category: { id: string; name: string };
    wallet: { id: string; name: string };
};

export type TransactionFilters = {
    startDate?: string;
    endDate?: string;
    type?: TransactionType;
    walletId?: string;
    categoryId?: string;
};

export type CreateTransactionInput = {
    amount: string;
    description?: string;
    date: string;
    type: 'INCOME' | 'EXPENSE';
    categoryId: string;
    walletId: string;
};

function toQuery(filters: TransactionFilters): string {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.type) params.set('type', filters.type);
    if (filters.walletId) params.set('walletIds', filters.walletId);
    if (filters.categoryId) params.set('categoryIds', filters.categoryId);
    const query = params.toString();
    return query ? `?${query}` : '';
}

export const transactionsApi = {
    list: (filters: TransactionFilters) => request<Transaction[]>(`/transactions${toQuery(filters)}`),
    create: (input: CreateTransactionInput) =>
        request<{ id: string }>('/transactions', { method: 'POST', body: input }),
    remove: (id: string) => request<void>(`/transactions/${id}`, { method: 'DELETE' }),
};
