import { t } from '@/shared/i18n';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Button, CloseIcon, LockIcon } from '@/shared/ui';
import { resolveTarget } from './dom';
import { SCREENS } from './steps';
import styles from './TourOverlay.module.css';
import type { Placement, TourStep } from './types';

type Props = {
    step: TourStep;
    steps: TourStep[];
    index: number;
    target: HTMLElement | null;
    busy: boolean;
    onNext: () => void;
    onBack: () => void;
    onClose: () => void;
};

type Geometry = {
    rect: { left: number; top: number; width: number; height: number; radius: number } | null;
    pw: number;
    ph: number;
    vw: number;
    vh: number;
};

const PAD = 6; // folga do destaque ao redor do elemento
const GAP = 16; // distância entre o destaque e a caixa de texto
const MARGIN = 12; // distância mínima da borda da tela

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));
const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const;
type Side = keyof typeof OPPOSITE;

type Placed = { left: number; top: number; side: Side | null; arrow: number; width?: number };

/** Escolhe o lado do elemento onde a caixa cabe, preferindo o pedido pelo passo. */
function place(geo: Geometry, pref: Placement, mobile: boolean): Placed {
    const { rect, pw, ph, vw, vh } = geo;
    if (!rect) return { left: (vw - pw) / 2, top: (vh - ph) / 2, side: null, arrow: 0 };

    const box = { left: rect.left - PAD, top: rect.top - PAD, right: rect.left + rect.width + PAD, bottom: rect.top + rect.height + PAD };
    const cx = (box.left + box.right) / 2;
    const cy = (box.top + box.bottom) / 2;

    // celular: a caixa ocupa a largura toda, mas fica colada no elemento (abaixo ou acima),
    // só sem cobri-lo; o resto da tela pode ficar por baixo dela
    if (mobile) {
        const width = vw - 2 * MARGIN;
        const below = vh - box.bottom - MARGIN;
        const above = box.top - MARGIN;
        const gap = 10;
        const useBelow = below >= ph + gap || (above < ph + gap && below >= above);
        const top = useBelow ? Math.min(box.bottom + gap, vh - ph - MARGIN) : Math.max(box.top - ph - gap, MARGIN);
        return { left: MARGIN, top, side: null, arrow: 0, width };
    }

    const room: Record<Side, number> = { bottom: vh - box.bottom, top: box.top, right: vw - box.right, left: box.left };
    const fits = (side: Side) =>
        side === 'top' || side === 'bottom' ? room[side] >= ph + GAP + MARGIN : room[side] >= pw + GAP + MARGIN;

    const first: Side[] = pref !== 'auto' ? [pref, OPPOSITE[pref]] : [];
    const order: Side[] = [...first, 'bottom', 'top', 'right', 'left'];
    const side = order.find(fits);

    if (!side) {
        // elemento enorme: a caixa vai por cima, na parte de baixo da tela
        return { left: clamp(cx - pw / 2, MARGIN, vw - pw - MARGIN), top: vh - ph - MARGIN, side: null, arrow: 0 };
    }

    let left: number;
    let top: number;
    if (side === 'bottom' || side === 'top') {
        left = clamp(cx - pw / 2, MARGIN, vw - pw - MARGIN);
        top = side === 'bottom' ? box.bottom + GAP : box.top - ph - GAP;
        return { left, top, side, arrow: clamp(cx - left, 22, pw - 22) };
    }
    top = clamp(cy - ph / 2, MARGIN, vh - ph - MARGIN);
    left = side === 'right' ? box.right + GAP : box.left - pw - GAP;
    return { left, top, side, arrow: clamp(cy - top, 22, ph - 22) };
}

/** Traz o elemento para uma área da tela onde ele e a caixa de texto aparecem juntos. */
function reveal(el: HTMLElement, mobile: boolean) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const top = mobile ? 72 : 96;
    const bottom = mobile ? 250 : 96; // no celular, sobra espaço embaixo para a caixa
    if (r.top >= top && r.bottom <= vh - bottom) return;

    const tall = r.height > vh - top - bottom;
    if (tall || mobile) {
        el.style.scrollMarginTop = `${top}px`;
        el.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
        el.style.scrollMarginTop = '';
    } else {
        el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
    }
}

const FOCUSABLE = 'button:not([disabled]), a[href]';

/**
 * Camada do tutorial: escurece a tela, deixa o elemento do passo iluminado e coloca a
 * caixa de texto ao lado dele. Acompanha o elemento a cada quadro, então continua certo
 * quando a tela rola, redimensiona ou recarrega dados.
 */
export function TourOverlay({ step, steps, index, target, busy, onNext, onBack, onClose }: Props) {
    const titleId = useId();
    const popRef = useRef<HTMLDivElement>(null);
    const blockerRef = useRef<HTMLDivElement>(null);
    const [geo, setGeo] = useState<Geometry>({ rect: null, pw: 0, ph: 0, vw: window.innerWidth, vh: window.innerHeight });

    const screen = SCREENS[step.screen];
    const sameScreen = steps.filter((s) => s.screen === step.screen);
    const positionInScreen = sameScreen.indexOf(step) + 1;
    const last = index === steps.length - 1;
    const mobile = geo.vw <= 760;

    // traz o elemento para a área visível quando o passo muda
    useLayoutEffect(() => {
        if (target) reveal(target, window.innerWidth <= 760);
    }, [target, step.id]);

    // acompanha o elemento quadro a quadro
    useEffect(() => {
        let raf = 0;
        let prevKey = '';
        let el = target;

        const tick = () => {
            if (step.target && (!el || !el.isConnected)) el = resolveTarget(step.target); // a tela recarregou os dados
            const pop = popRef.current;
            const r = el && el.isConnected ? el.getBoundingClientRect() : null;
            const key = [r ? `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.height)}` : '-', pop?.offsetWidth, pop?.offsetHeight, window.innerWidth, window.innerHeight].join('|');

            if (key !== prevKey) {
                prevKey = key;
                const radius = el && r ? parseFloat(getComputedStyle(el).borderRadius) || 0 : 0;
                setGeo({
                    rect: r ? { left: r.left, top: r.top, width: r.width, height: r.height, radius } : null,
                    pw: pop?.offsetWidth ?? 0,
                    ph: pop?.offsetHeight ?? 0,
                    vw: window.innerWidth,
                    vh: window.innerHeight,
                });
            }
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [step, target]);

    // a página atrás não rola enquanto o tutorial está aberto
    useEffect(() => {
        const node = blockerRef.current;
        if (!node) return;
        const stop = (e: Event) => e.preventDefault();
        node.addEventListener('wheel', stop, { passive: false });
        node.addEventListener('touchmove', stop, { passive: false });
        return () => {
            node.removeEventListener('wheel', stop);
            node.removeEventListener('touchmove', stop);
        };
    }, []);

    // foco na caixa a cada passo (leitores de tela anunciam o título)
    useEffect(() => {
        popRef.current?.focus({ preventScroll: true });
    }, [step.id]);

    // teclado: setas trocam de passo, Esc sai, Tab fica dentro da caixa.
    // Em captura e com stopPropagation, para o foco/Esc do modal do app não competirem.
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
            } else if (e.key === 'ArrowRight') {
                e.stopPropagation();
                if (!busy) onNext();
            } else if (e.key === 'ArrowLeft') {
                e.stopPropagation();
                if (!busy && index > 0) onBack();
            } else if (e.key === 'Tab') {
                e.stopPropagation();
                const items = Array.from(popRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
                if (items.length === 0) return;
                e.preventDefault();
                const at = items.indexOf(document.activeElement as HTMLElement);
                const nextIndex = e.shiftKey ? (at <= 0 ? items.length - 1 : at - 1) : at === items.length - 1 ? 0 : at + 1;
                items[nextIndex]?.focus();
            }
        }
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    }, [busy, index, onBack, onClose, onNext]);

    const placed = place(geo, step.placement ?? 'auto', mobile);
    const { rect } = geo;
    const ready = geo.ph > 0;

    return createPortal(
        <div className={styles.root}>
            {/* bloqueia cliques na tela enquanto o tutorial está aberto; sem alvo, também escurece */}
            <div ref={blockerRef} className={`${styles.blocker} ${rect ? '' : styles.dim}`} />

            {rect && (
                <div
                    className={styles.spot}
                    aria-hidden="true"
                    style={{
                        left: rect.left - PAD,
                        top: rect.top - PAD,
                        width: rect.width + 2 * PAD,
                        height: rect.height + 2 * PAD,
                        borderRadius: rect.radius + PAD,
                    }}
                />
            )}

            <div
                ref={popRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-busy={busy}
                className={`${styles.pop} ${rect ? '' : styles.center}`}
                style={{
                    left: placed.left,
                    top: placed.top,
                    visibility: ready ? 'visible' : 'hidden',
                    ...(placed.width ? { width: placed.width } : {}),
                }}
            >

                <header className={styles.header}>
                    <span className={styles.icon} aria-hidden="true">
                        {screen.icon}
                    </span>
                    <span className={styles.where}>
                        <strong>{screen.label}</strong>
                        <span>
                            {t('tutorial.of', { n: positionInScreen, total: sameScreen.length })}
                        </span>
                    </span>
                    <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar tutorial">
                        <CloseIcon size={18} />
                    </button>
                </header>

                <div aria-live="polite">
                    <h2 id={titleId} className={styles.title}>
                        {step.title}
                    </h2>
                    <p className={styles.text}>{step.text}</p>
                    {step.locked && (
                        <p className={styles.locked}>
                            <LockIcon size={16} />
                            <Link to="/planos" onClick={onClose}>
                                {t('tutorial.seePlans')}
                            </Link>
                        </p>
                    )}
                </div>

                <div className={styles.progress} role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={index + 1} aria-label={t('tutorial.progress')}>
                    <i style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
                </div>

                <footer className={styles.footer}>
                    <button type="button" className={styles.skip} onClick={onClose} disabled={busy}>
                        {t('tutorial.exit')}
                    </button>
                    <div className={styles.nav}>
                        {index > 0 && (
                            <Button variant="ghost" onClick={onBack} disabled={busy}>
                                {t('tutorial.back')}
                            </Button>
                        )}
                        <Button onClick={onNext} disabled={busy}>
                            {last ? t('tutorial.finish') : step.id === 'welcome' ? t('tutorial.start') : t('tutorial.next')}
                        </Button>
                    </div>
                </footer>
            </div>
        </div>,
        document.body,
    );
}
