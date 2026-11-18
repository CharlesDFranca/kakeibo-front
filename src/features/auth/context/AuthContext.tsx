import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { ApiError } from '@/shared/api/api-error';
import { authApi, type CurrentUser, type Plan } from '../api/auth.api';

type Status = 'loading' | 'authenticated' | 'anonymous';

type AuthContextValue = {
    status: Status;
    user: CurrentUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    /** Troca o plano e recarrega o usuário (as features mudam junto). */
    changePlan: (plan: Plan) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<Status>('loading');
    const [user, setUser] = useState<CurrentUser | null>(null);

    const loadUser = useCallback(async () => {
        try {
            setUser(await authApi.me());
            setStatus('authenticated');
        } catch (error) {
            setUser(null);
            setStatus('anonymous');
            // 401 é o estado normal de quem não tem sessão; o resto vale propagar.
            if (!(error instanceof ApiError) || error.status >= 500) {
                console.error(error);
            }
        }
    }, []);

    useEffect(() => {
        void loadUser();
    }, [loadUser]);

    const login = useCallback(
        async (email: string, password: string) => {
            await authApi.login({ email, password });
            await loadUser();
        },
        [loadUser],
    );

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
            setStatus('anonymous');
        }
    }, []);

    const changePlan = useCallback(
        async (plan: Plan) => {
            await authApi.changePlan(plan);
            await loadUser();
        },
        [loadUser],
    );

    const value = useMemo(
        () => ({ status, user, login, logout, changePlan }),
        [status, user, login, logout, changePlan],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
    return ctx;
}
