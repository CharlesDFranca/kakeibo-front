import type { Target, TargetSpec } from './types';

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

function resolveOne(target: Target): HTMLElement | null {
    if (typeof target === 'string') return document.querySelector<HTMLElement>(target);

    if ('field' in target) {
        const wanted = norm(target.field);
        for (const label of document.querySelectorAll<HTMLLabelElement>('[data-tour="modal"] label')) {
            // o destaque pega o campo inteiro (rótulo + controle + dica), não só o rótulo
            if (norm(label.textContent ?? '').startsWith(wanted)) return label.parentElement;
        }
        return null;
    }

    const wanted = norm(target.text);
    for (const el of document.querySelectorAll<HTMLElement>(target.sel)) {
        if (norm(el.textContent ?? '').startsWith(wanted)) return el;
    }
    return null;
}

const isVisible = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
};

/** Primeiro alvo (da lista, se for uma) que existe e está visível. */
export function resolveTarget(spec: TargetSpec): HTMLElement | null {
    for (const target of Array.isArray(spec) ? spec : [spec]) {
        const el = resolveOne(target);
        if (el && isVisible(el)) return el;
    }
    return null;
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** Repete `check` até devolver algo ou estourar o tempo (as telas carregam dados de forma assíncrona). */
export async function waitFor<T>(check: () => T | null | undefined | false, timeoutMs: number, cancelled: () => boolean): Promise<T | null> {
    const end = Date.now() + timeoutMs;
    for (;;) {
        if (cancelled()) return null;
        const found = check();
        if (found) return found;
        if (Date.now() >= end) return null;
        await sleep(60);
    }
}
