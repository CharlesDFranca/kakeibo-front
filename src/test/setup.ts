import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { setDemoResolver } from '@/shared/api/http-client';
import { setCurrentLocale } from '@/shared/i18n/i18n';

// O jsdom não tem estas APIs do navegador; o app as usa de forma opcional.
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
})) as typeof window.matchMedia;
globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

beforeEach(() => {
    localStorage.clear();
    // O jsdom declara "en-US"; os testes partem sempre do português (os textos vêm de t(), não ficam fixos no teste).
    setCurrentLocale('pt');
});

afterEach(() => {
    // Sem `globals: true` o Testing Library não limpa sozinho entre os testes.
    cleanup();
    setDemoResolver(null);
});
