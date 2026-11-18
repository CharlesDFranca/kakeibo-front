/**
 * Converte o texto digitado ("1.234,56", "10,5", "10.50") para o formato da API
 * ("1234.56"). Devolve null se não for um valor monetário válido.
 */
export function parseMoneyInput(raw: string): string | null {
    let text = raw.replace(/[R$\s]/g, '');
    if (!text) return null;

    if (text.includes(',')) {
        // vírgula é o separador decimal; pontos são milhares
        text = text.replace(/\./g, '').replace(',', '.');
    } else if ((text.match(/\./g) ?? []).length > 1) {
        // vários pontos só fazem sentido como separador de milhar (1.234.567)
        if (!/^\d{1,3}(\.\d{3})+$/.test(text)) return null;
        text = text.replace(/\./g, '');
    }

    if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;

    const [int = '0', dec = ''] = text.split('.');
    return `${int.replace(/^0+(?=\d)/, '')}.${dec.padEnd(2, '0')}`;
}
