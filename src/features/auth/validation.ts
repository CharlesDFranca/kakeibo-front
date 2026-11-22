import { t } from '@/shared/i18n';
export type FieldErrors<T extends string> = Partial<Record<T, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

export type LoginValues = { email: string; password: string };

export function validateLogin(v: LoginValues): FieldErrors<keyof LoginValues> {
    const errors: FieldErrors<keyof LoginValues> = {};
    if (!EMAIL.test(v.email.trim())) errors.email = t('auth.validation.email');
    if (!v.password) errors.password = t('auth.validation.password');
    return errors;
}

export type RegisterValues = {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export function validateRegister(
    v: RegisterValues,
): FieldErrors<keyof RegisterValues> {
    const errors: FieldErrors<keyof RegisterValues> = {};
    if (!v.username.trim()) errors.username = t('auth.validation.username');
    if (!EMAIL.test(v.email.trim())) errors.email = t('auth.validation.email');
    if (v.password.length < PASSWORD_MIN_LENGTH) {
        errors.password = t('auth.validation.passwordMin', { min: PASSWORD_MIN_LENGTH });
    }
    if (v.confirmPassword !== v.password) {
        errors.confirmPassword = t('auth.validation.passwordMismatch');
    }
    return errors;
}
