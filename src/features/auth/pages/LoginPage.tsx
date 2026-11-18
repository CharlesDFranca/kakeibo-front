import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, TextField } from '@/shared/ui';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { authErrorMessage } from '../error-messages';
import { validateLogin, type FieldErrors, type LoginValues } from '../validation';
import styles from './AuthForm.module.css';

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const justRegistered = (location.state as { registered?: boolean } | null)?.registered;

    const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
    const [errors, setErrors] = useState<FieldErrors<keyof LoginValues>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const set = (field: keyof LoginValues) => (e: ChangeEvent<HTMLInputElement>) => {
        setValues((v) => ({ ...v, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        const found = validateLogin(values);
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSubmitting(true);
        try {
            await login(values.email.trim(), values.password);
            navigate('/', { replace: true });
        } catch (error) {
            setFormError(authErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout
            title="Bem-vindo de volta"
            subtitle="Entre para acompanhar suas finanças."
            footer={
                <>
                    Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
                </>
            }
        >
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {justRegistered && (
                    <Alert tone="success">Conta criada! Entre com seus dados.</Alert>
                )}
                {formError && <Alert tone="danger">{formError}</Alert>}

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
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    value={values.password}
                    onChange={set('password')}
                    error={errors.password}
                />

                <Button type="submit" fullWidth loading={submitting}>
                    Entrar
                </Button>
            </form>
        </AuthLayout>
    );
}
