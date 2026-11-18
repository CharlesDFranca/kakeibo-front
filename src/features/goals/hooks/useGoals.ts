import { useAsyncData } from '@/shared/hooks/useAsyncData';
import { goalsApi } from '../api/goals.api';

export const useGoals = () => useAsyncData(goalsApi.list, []);
export const useGoal = (id: string) => useAsyncData(() => goalsApi.find(id), [id]);
