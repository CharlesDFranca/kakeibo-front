import { useCallback } from 'react';
import { useAsyncData } from '@/shared/hooks/useAsyncData';
import { categoriesApi } from '../api/categories.api';

export function useCategories() {
    const { state, reload } = useAsyncData(categoriesApi.list, []);

    /** Cria a categoria, recarrega a lista e devolve o id criado. */
    const create = useCallback(
        async (name: string) => {
            const { id } = await categoriesApi.create(name);
            reload();
            return id;
        },
        [reload],
    );

    return { state, reload, create };
}
