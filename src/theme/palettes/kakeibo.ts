/**
 * Cores brutas da marca. É o ÚNICO lugar com valores hexadecimais da paleta.
 * Os temas escolhem quais cores usar e para quê (ver ../themes).
 */
export const kakeiboPalette = {
    purple: '#564787',
    mauve: '#DBCBD8',
    ice: '#F2FDFF',
    teal: '#9AD4D6',
    navy: '#101935',
} as const;

export type Palette = Record<string, string>;
