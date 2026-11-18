import type { Theme } from '../types';
import { darkTheme } from './dark';
import { carmimTheme, lagoaTheme, musgoTheme, nevoaTheme, noturnoTheme, prismaTheme } from './extra';

/** Registro de temas (a ordem é a da tela de Perfil). Para adicionar um: crie o tema e liste aqui. */
const all: Theme[] = [darkTheme, prismaTheme, lagoaTheme, noturnoTheme, nevoaTheme, carmimTheme, musgoTheme];

export const themes: Record<string, Theme> = Object.fromEntries(all.map((t) => [t.id, t]));

export const DEFAULT_THEME_ID = darkTheme.id;
