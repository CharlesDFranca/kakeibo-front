import { apiErrorMessage } from '@/shared/api/error-messages';

export const authErrorMessage = (error: unknown) =>
    apiErrorMessage(error, 'Não foi possível concluir a operação. Verifique os dados.');

/** Em qual campo mostrar cada erro conhecido (quando faz sentido). */
export const FIELD_BY_CODE: Record<string, 'email' | 'username'> = {
    EMAIL_ALREADY_EXISTS: 'email',
    USERNAME_ALREADY_EXISTS: 'username',
};
