import { request } from '@/shared/api/http-client';

/** Valores exatamente como a API envia (note o espaço em "IN PROGRESS"). */
export type GoalStatus = 'IN PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export type Goal = {
    id: string;
    name: string;
    status: GoalStatus;
    currentAmount: string;
    targetAmount: string;
    deadline: string | null;
};

export type GoalMovement = {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAW';
    amount: string;
    walletId: string;
    revertedDepositId: string | null;
    /** Aporte que já foi estornado. */
    reverted: boolean;
    createdAt: string;
};

export type GoalDetails = Omit<Goal, 'id'> & { goalId: string; movements: GoalMovement[] };

export const goalsApi = {
    list: async () => (await request<{ goals: Goal[] }>('/goals')).goals,
    find: (id: string) => request<GoalDetails>(`/goals/${id}`),
    create: (input: { name: string; targetAmount: string; deadline: string }) =>
        request<{ id: string }>('/goals', { method: 'POST', body: input }),
    rename: (id: string, name: string) => request<unknown>(`/goals/${id}`, { method: 'PATCH', body: { name } }),
    cancel: (id: string) => request<void>(`/goals/${id}`, { method: 'DELETE' }),
    reactivate: (id: string, deadline: string) =>
        request<void>(`/goals/${id}/reactivate`, { method: 'POST', body: { deadline } }),
    deposit: (id: string, input: { walletId: string; amount: string }) =>
        request<unknown>(`/goals/${id}/deposits`, { method: 'POST', body: input }),
    revertDeposit: (id: string, depositId: string) =>
        request<unknown>(`/goals/${id}/deposits/${depositId}/revert`, { method: 'POST' }),
};
