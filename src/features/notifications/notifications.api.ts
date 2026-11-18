import { request } from '@/shared/api/http-client';

export type NotificationType = 'GOAL_REACHED';

export type AppNotification = {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
};

export const notificationsApi = {
    list: (unreadOnly = false) => request<AppNotification[]>(unreadOnly ? '/notifications?unread=true' : '/notifications'),
    markAsRead: (id: string) => request<void>(`/notifications/${id}/read`, { method: 'PATCH' }),
};
