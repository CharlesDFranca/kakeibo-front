import { request } from '@/shared/api/http-client';

export type TransferStatus = 'COMPLETED' | 'REVERTED';

export type Transfer = {
    id: string;
    amount: string;
    status: TransferStatus;
    sourceWallet: { id: string; name: string };
    destinationWallet: { id: string; name: string };
    createdAt: string;
    updatedAt: string;
};

export const transfersApi = {
    list: (status?: TransferStatus) => request<Transfer[]>(`/transfers${status ? `?status=${status}` : ''}`),
    find: (id: string) => request<Transfer>(`/transfers/${id}`),
    create: (input: { amount: string; sourceWalletId: string; destinationWalletId: string }) =>
        request<{ id: string }>('/transfers', { method: 'POST', body: input }),
    revert: (id: string) => request<void>(`/transfers/${id}/revert`, { method: 'POST' }),
};
