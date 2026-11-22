import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Outlet } from 'react-router-dom';
import { setDemoResolver } from '@/shared/api/http-client';
import { createDemoResolver } from './demo';
import { resolveTarget, waitFor } from './dom';
import { TourOverlay } from './TourOverlay';
import { buildSteps, SCREENS, tutorialForPath } from './steps';
import type { ScreenId, TourStep } from './types';

type TutorialContextValue = {
    /** Leva à tela do tutorial `id` e o mostra (lista "Rever" do Perfil). */
    replay: (id: ScreenId) => void;
    /** Zera os tutoriais vistos e volta ao painel, como na primeira visita. */
    resetAll: () => void;
    /** Muda quando o tutorial liga/desliga os dados de exemplo; quem mostra as telas usa como `key` para recarregá-las. */
    demoKey: number;
};

const TutorialContext = createContext<TutorialContextValue | null>(null);

const MODAL = '[data-tour="modal"]';
const NAV_ATTR = 'data-tour-nav';

/**
 * Tutorial guiado. A cada passo ele: leva à tela do passo, abre/fecha o modal que o passo
 * precisa (clicando nos botões reais do app), espera o elemento aparecer e o destaca.
 * Cada tela tem o seu tutorial, que abre sozinho na primeira visita a ela (o registro fica no backend) e pode ser repetido por `useTutorial().replay(id)`.
 */
export function TutorialProvider({ children }: { children: ReactNode }) {
    const { user, markTutorialSeen, resetTutorials } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const userId = user?.id;
    const userRef = useRef(user);
    userRef.current = user;

    const allSteps = useMemo(() => buildSteps(user?.features ?? []), [user?.features]);
    const [steps, setSteps] = useState<TourStep[]>([]); // só os passos do tutorial em andamento
    const stepsRef = useRef<TourStep[]>([]);
    stepsRef.current = steps;
    const currentId = useRef<ScreenId | null>(null);
    const offered = useRef(new Set<string>()); // tutoriais já abertos nesta sessão: não reabrem sozinhos
    const running = useRef(false);

    const [index, setIndex] = useState<number | null>(null);
    const [target, setTarget] = useState<HTMLElement | null>(null);
    const [busy, setBusy] = useState(false);

    const pathRef = useRef(location.pathname);
    pathRef.current = location.pathname;
    const origin = useRef('/');
    const run = useRef(0); // identifica a execução mais recente; as antigas se cancelam
    const openModal = useRef<string | null>(null);
    const [demoKey, setDemoKey] = useState(0);

    const goPath = useCallback(
        async (path: string, cancelled: () => boolean) => {
            if (pathRef.current === path) return;
            navigate(path);
            await waitFor(() => (pathRef.current === path ? true : null), 3000, cancelled);
        },
        [navigate],
    );

    const closeModal = useCallback(async (cancelled: () => boolean) => {
        const button = document.querySelector<HTMLElement>(`${MODAL} [data-tour="modal-close"]`);
        if (button) {
            button.click();
            await waitFor(() => (document.querySelector(MODAL) ? null : true), 1500, cancelled);
        }
        openModal.current = null;
    }, []);

    /** Deixa a tela pronta para o passo. 'skip' = passo não se aplica agora. */
    const prepare = useCallback(
        async (step: TourStep, cancelled: () => boolean): Promise<{ status: 'ok'; el: HTMLElement | null } | { status: 'skip' | 'cancel' }> => {
            const path = step.route;
            const wantModal = step.modal?.key ?? null;

            // fecha o modal que não pertence a este passo (ou que ficaria para trás ao trocar de tela)
            if (openModal.current && (openModal.current !== wantModal || (path && path !== pathRef.current))) await closeModal(cancelled);
            if (cancelled()) return { status: 'cancel' };

            if (path) await goPath(path, cancelled);
            if (cancelled()) return { status: 'cancel' };

            if (step.modal && openModal.current !== step.modal.key) {
                const opener = await waitFor(() => resolveTarget(step.modal!.opener), 3000, cancelled);
                if (cancelled()) return { status: 'cancel' };
                if (!opener) return { status: 'skip' };
                opener.click();
                openModal.current = step.modal.key;
                const opened = await waitFor(() => document.querySelector(MODAL), 2000, cancelled);
                if (cancelled()) return { status: 'cancel' };
                if (!opened) return { status: 'skip' };
            }

            if (step.nav) document.documentElement.setAttribute(NAV_ATTR, '');
            else document.documentElement.removeAttribute(NAV_ATTR);

            if (!step.target) return { status: 'ok', el: null };

            // os dados da tela carregam de forma assíncrona; alvos opcionais esperam menos
            const el = await waitFor(() => resolveTarget(step.target!), step.optional ? 600 : 3000, cancelled);
            if (cancelled()) return { status: 'cancel' };
            if (!el) return step.optional ? { status: 'skip' } : { status: 'ok', el: null };
            return { status: 'ok', el };
        },
        [closeModal, goPath],
    );

    const cleanup = useCallback(() => {
        document.documentElement.removeAttribute(NAV_ATTR);
    }, []);

    const finish = useCallback(
        async (token: number) => {
            const cancelled = () => token !== run.current;
            if (currentId.current) void markTutorialSeen(currentId.current); // registra no backend
            currentId.current = null;
            running.current = false;
            await closeModal(cancelled);
            cleanup();
            setDemoResolver(null); // volta aos dados reais
            setDemoKey((k) => k + 1);
            setIndex(null);
            setTarget(null);
            setBusy(false);
            if (pathRef.current !== origin.current) navigate(origin.current); // volta para a tela de origem
        },
        [cleanup, closeModal, markTutorialSeen, navigate],
    );

    const goTo = useCallback(
        async (from: number, direction: 1 | -1) => {
            const token = ++run.current;
            const cancelled = () => token !== run.current;
            setBusy(true);

            const list = stepsRef.current;
            for (let i = from; i >= 0 && i < list.length; i += direction) {
                const result = await prepare(list[i]!, cancelled);
                if (cancelled() || result.status === 'cancel') return;
                if (result.status === 'ok') {
                    setTarget(result.el);
                    setIndex(i);
                    setBusy(false);
                    return;
                }
            }

            if (direction === 1) await finish(token);
            else setBusy(false); // não há passo anterior que se aplique: fica onde estava
        },
        [finish, prepare],
    );

    /** Roda o tutorial da tela `id` (a tela de origem é a atual). */
    const startTour = useCallback(
        (id: ScreenId) => {
            const list = allSteps.filter((step) => step.screen === id);
            if (list.length === 0 || running.current) return;
            running.current = true;
            offered.current.add(id);
            currentId.current = id;
            origin.current = pathRef.current;
            openModal.current = null;
            stepsRef.current = list;
            setSteps(list);
            setDemoResolver(createDemoResolver({ canAnalyze: userRef.current?.features.includes('CATEGORY_ANALYSIS') ?? false }));
            setDemoKey((k) => k + 1);
            void goTo(0, 1);
        },
        [allSteps, goTo],
    );

    const replay = useCallback(
        (id: ScreenId) => {
            const route = SCREENS[id].route;
            if (pathRef.current !== route) navigate(route);
            window.setTimeout(() => startTour(id), 250);
        },
        [navigate, startTour],
    );

    const resetAll = useCallback(() => {
        offered.current.clear();
        void resetTutorials();
        navigate('/');
    }, [navigate, resetTutorials]);

    const close = useCallback(() => {
        void finish(++run.current);
    }, [finish]);

    const next = useCallback(() => {
        if (index !== null) void goTo(index + 1, 1);
    }, [goTo, index]);

    const back = useCallback(() => {
        if (index !== null) void goTo(index - 1, -1);
    }, [goTo, index]);

    // Primeira visita a uma tela: mostra o tutorial dela, uma vez.
    const seen = user?.seenTutorials;
    useEffect(() => {
        if (!userId || !seen || running.current) return;
        const id = tutorialForPath(location.pathname);
        if (!id || seen.includes(id) || offered.current.has(id)) return;
        if (id === 'goal' && !userRef.current?.features.includes('GOALS')) return;
        const timer = window.setTimeout(() => startTour(id), 700);
        return () => window.clearTimeout(timer);
    }, [userId, seen, location.pathname, startTour]);

    useEffect(
        () => () => {
            cleanup();
            setDemoResolver(null);
        },
        [cleanup],
    );

    const value = useMemo(() => ({ replay, resetAll, demoKey }), [replay, resetAll, demoKey]);
    const step = index !== null ? steps[index] : undefined;

    return (
        <TutorialContext.Provider value={value}>
            {children}
            {step && index !== null && (
                <TourOverlay
                    step={step}
                    steps={steps}
                    index={index}
                    target={target}
                    busy={busy}
                    onNext={next}
                    onBack={back}
                    onClose={close}
                />
            )}
        </TutorialContext.Provider>
    );
}

export function useTutorial(): TutorialContextValue {
    const ctx = useContext(TutorialContext);
    if (!ctx) throw new Error('useTutorial precisa estar dentro de <TutorialProvider>');
    return ctx;
}

/** Mostra a tela atual; recarrega quando o tutorial liga ou desliga os dados de exemplo. */
export function TutorialOutlet() {
    const { demoKey } = useTutorial();
    return <Outlet key={demoKey} />;
}
