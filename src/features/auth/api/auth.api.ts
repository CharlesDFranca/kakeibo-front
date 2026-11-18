import { request } from '@/shared/api/http-client';

export type Plan = 'FREE' | 'PLUS' | 'PRO';

export type CurrentUser = {
    id: string;
    name: string;
    username: string;
    plan: Plan;
    features: string[];
};

export type RegisterInput = {
    name?: string;
    username: string;
    email: string;
    password: string;
};

export const authApi = {
    login: (input: { email: string; password: string }) =>
        request<void>('/auth/login', { method: 'POST', body: input }),

    logout: () => request<void>('/auth/logout', { method: 'POST' }),

    register: (input: RegisterInput) =>
        request<{ id: string }>('/users', { method: 'POST', body: input }),

    me: () => request<CurrentUser>('/users/me'),

    changePlan: (plan: Plan) =>
        request<{ plan: Plan }>('/users/me/plan', { method: 'PATCH', body: { plan } }),
};
