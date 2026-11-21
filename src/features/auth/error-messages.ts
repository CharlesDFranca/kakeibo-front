import { apiErrorMessage } from '@/shared/i18n';

export const authErrorMessage = (error: unknown) => apiErrorMessage(error);

/** Em qual campo mostrar cada erro conhecido (quando faz sentido). */
export const FIELD_BY_CODE: Record<string, 'email' | 'username'> = {
    EMAIL_ALREADY_EXISTS: 'email',
    USERNAME_ALREADY_EXISTS: 'username',
};
