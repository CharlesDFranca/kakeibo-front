import { formatCurrency } from '@/shared/format/format';

/**
 * O Testing Library troca espaços especiais por um espaço comum ao ler o texto da tela, mas não faz isso com o
 * texto procurado. O formato de moeda usa espaço não separável ("R$ 1.234,50"), então a busca passa por aqui.
 */
export const plain = (text: string): string => text.replace(/\s+/g, ' ');

/** Valor em reais como aparece na tela, pronto para `getByText`. */
export const brl = (amount: string | number): string => plain(formatCurrency(amount));
