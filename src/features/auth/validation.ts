export type FieldErrors<T extends string> = Partial<Record<T, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

export type LoginValues = { email: string; password: string };

export function validateLogin(v: LoginValues): FieldErrors<keyof LoginValues> {
    const errors: FieldErrors<keyof LoginValues> = {};
    if (!EMAIL.test(v.email.trim())) errors.email = 'Informe um e-mail válido.';
    if (!v.password) errors.password = 'Informe sua senha.';
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
    if (!v.username.trim()) errors.username = 'Informe um nome de usuário.';
    if (!EMAIL.test(v.email.trim())) errors.email = 'Informe um e-mail válido.';
    if (v.password.length < PASSWORD_MIN_LENGTH) {
        errors.password = `A senha precisa ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    }
    if (v.confirmPassword !== v.password) {
        errors.confirmPassword = 'As senhas não coincidem.';
    }
    return errors;
}
