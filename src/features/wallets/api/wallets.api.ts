import { request } from '@/shared/api/http-client';

export type Wallet = { id: string; name: string; balance: string };

export const walletsApi = {
    list: () => request<Wallet[]>('/wallets'),
    create: (input: { name: string; balance: string }) =>
        request<{ id: string }>('/wallets', { method: 'POST', body: input }),
    rename: (id: string, name: string) =>
        request<unknown>(`/wallets/${id}`, { method: 'PATCH', body: { name } }),
    remove: (id: string) => request<void>(`/wallets/${id}`, { method: 'DELETE' }),
};
