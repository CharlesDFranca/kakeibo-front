import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '@/shared/api/api-error';
import { Alert, Button, TextField } from '@/shared/ui';
import { authApi } from '../api/auth.api';
import { AuthLayout } from '../components/AuthLayout';
import { FIELD_BY_CODE, authErrorMessage } from '../error-messages';
import {
    PASSWORD_MIN_LENGTH,
    validateRegister,
    type FieldErrors,
    type RegisterValues,
} from '../validation';
import styles from './AuthForm.module.css';

const EMPTY: RegisterValues = {
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
};

export function RegisterPage() {
    const navigate = useNavigate();
    const [values, setValues] = useState<RegisterValues>(EMPTY);
    const [errors, setErrors] = useState<FieldErrors<keyof RegisterValues>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const set = (field: keyof RegisterValues) => (e: ChangeEvent<HTMLInputElement>) => {
        setValues((v) => ({ ...v, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        const found = validateRegister(values);
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSubmitting(true);
        try {
            const name = values.name.trim();
            await authApi.register({
                ...(name ? { name } : {}),
                username: values.username.trim(),
                email: values.email.trim(),
                password: values.password,
            });
            navigate('/login', { replace: true, state: { registered: true } });
        } catch (error) {
            const field = error instanceof ApiError ? FIELD_BY_CODE[error.code] : undefined;
            if (field) {
                setErrors({ [field]: authErrorMessage(error) });
            } else {
                setFormError(authErrorMessage(error));
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout
            title="Crie sua conta"
            subtitle="Leva menos de um minuto."
            footer={
                <>
                    Já tem conta? <Link to="/login">Entrar</Link>
                </>
            }
        >
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}

                <TextField
                    label="Nome (opcional)"
                    autoComplete="name"
                    placeholder="Como quer ser chamado"
                    value={values.name}
                    onChange={set('name')}
                />
                <TextField
                    label="Nome de usuário"
                    autoComplete="username"
                    placeholder="seu.usuario"
                    value={values.username}
                    onChange={set('username')}
                    error={errors.username}
                />
                <TextField
                    label="E-mail"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    value={values.email}
                    onChange={set('email')}
                    error={errors.email}
                />
                <TextField
                    label="Senha"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Crie uma senha"
                    hint={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres.`}
                    value={values.password}
                    onChange={set('password')}
                    error={errors.password}
                />
                <TextField
                    label="Confirmar senha"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                    value={values.confirmPassword}
                    onChange={set('confirmPassword')}
                    error={errors.confirmPassword}
                />

                <Button type="submit" fullWidth loading={submitting}>
                    Criar conta
                </Button>
            </form>
        </AuthLayout>
    );
}
