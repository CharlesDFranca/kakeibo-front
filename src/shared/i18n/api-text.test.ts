import { describe, expect, it } from 'vitest';
import { ApiError, NetworkError } from '@/shared/api/api-error';
import { apiErrorMessage, categoryLabel, descriptionLabel, notificationText } from './api-text';
import { setCurrentLocale, t } from './i18n';

describe('apiErrorMessage', () => {
    it('traduz pelo código do erro, nunca pelo texto em inglês da API', () => {
        const error = new ApiError('INVALID_CREDENTIALS', 'Invalid credentials.', 401);
        expect(apiErrorMessage(error)).toBe(t('error.INVALID_CREDENTIALS'));
        setCurrentLocale('en');
        expect(apiErrorMessage(error)).toBe('Wrong email or password.');
    });

    it('sem tradução do código, usa o status HTTP', () => {
        expect(apiErrorMessage(new ApiError('HTTP_403', 'x', 403))).toBe(t('api.http403'));
    });

    it('código desconhecido: mensagem de servidor para 5xx e genérica para o resto', () => {
        expect(apiErrorMessage(new ApiError('NOVO_CODIGO', 'x', 500))).toBe(t('api.server'));
        expect(apiErrorMessage(new ApiError('NOVO_CODIGO', 'x', 422))).toBe(t('api.fallback'));
    });

    it('erro de rede e erro qualquer têm mensagens próprias', () => {
        expect(apiErrorMessage(new NetworkError())).toBe(t('api.network'));
        expect(apiErrorMessage(new Error('boom'))).toBe(t('api.unexpected'));
    });
});

describe('categoryLabel', () => {
    it('traduz as categorias padrão para o idioma atual, em qualquer idioma de origem', () => {
        expect(categoryLabel('Food')).toBe('Alimentação');
        expect(categoryLabel('moradia')).toBe('Moradia');
        setCurrentLocale('en');
        expect(categoryLabel('Alimentação')).toBe('Food');
        expect(categoryLabel('Outros')).toBe('Other');
        expect(categoryLabel('Saúde')).toBe('Health');
    });

    it('traduz as categorias do sistema', () => {
        expect(categoryLabel('TRANSFER')).toBe(t('category.transfer'));
        expect(categoryLabel('Opening balance')).toBe(t('category.openingBalance'));
        expect(categoryLabel('adjustment')).toBe(t('category.adjustment'));
    });

    it('não mexe nas categorias criadas pelo usuário', () => {
        expect(categoryLabel('Pets')).toBe('Pets');
        setCurrentLocale('en');
        expect(categoryLabel('Gatos e cachorros')).toBe('Gatos e cachorros');
    });
});

describe('descriptionLabel', () => {
    it('traduz as descrições automáticas e preserva as digitadas', () => {
        setCurrentLocale('en');
        expect(descriptionLabel('Saldo inicial')).toBe(t('description.openingBalance'));
        expect(descriptionLabel('Transferência')).toBe(t('description.transfer'));
        expect(descriptionLabel('Almoço de domingo')).toBe('Almoço de domingo');
    });
});

describe('notificationText', () => {
    const goalReached = { type: 'GOAL_REACHED', title: 'Meta atingida', message: 'Você atingiu a meta "Viagem ao Japão" (R$ 8000.00).' };

    it('monta o aviso de meta alcançada no idioma atual, formatando o valor', () => {
        setCurrentLocale('en');
        const text = notificationText(goalReached);
        expect(text.title).toBe('Goal reached!');
        expect(text.message).toMatch(/^You reached the goal "Viagem ao Japão" \(R\$\s?8,000\.00\)\.$/);
    });

    it('aceita valor já com vírgula decimal (avisos antigos)', () => {
        expect(notificationText({ ...goalReached, message: 'Você atingiu a meta "Casa" (R$ 8.000,00).' }).message).toMatch(/R\$\s8\.000,00/);
    });

    it('tipo desconhecido mantém o texto original', () => {
        expect(notificationText({ type: 'OUTRO', title: 'Título', message: 'Mensagem' })).toEqual({ title: 'Título', message: 'Mensagem' });
    });
});
