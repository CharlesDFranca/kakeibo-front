import { request } from '@/shared/api/http-client';

export type Category = { id: string; name: string };

export const categoriesApi = {
    list: () => request<Category[]>('/categories'),
    create: (name: string) => request<{ id: string }>('/categories', { method: 'POST', body: { name } }),
};
