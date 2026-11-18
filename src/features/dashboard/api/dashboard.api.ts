import { request } from '@/shared/api/http-client';
import type { DateRange } from '../periods';

export type TransactionType =
    | 'INCOME'
    | 'EXPENSE'
    | 'TRANSFER'
    | 'OPENING_BALANCE'
    | 'ADJUSTMENT';

export type FinanceDashboard = {
    balance: { current: string; income: string; expenses: string };
    financialEvolution: { date: string; income: string; expenses: string; balance: string }[];
    /** null quando o plano não inclui a análise por categoria. */
    expensesByCategory:
        | { categoryId: string; categoryName: string; amount: string; percentage: number }[]
        | null;
    recentTransactions: {
        id: string;
        description: string;
        amount: string;
        date: string;
        type: TransactionType;
        category: { id: string; name: string };
        wallet: { id: string; name: string };
    }[];
};

export type GoalSummary = {
    id: string;
    name: string;
    currentAmount: string;
    targetAmount: string;
    percentage: number;
    deadline: string | null;
};

export const dashboardApi = {
    finance: (range: DateRange) =>
        request<FinanceDashboard>(
            `/finance/dashboard?startDate=${range.startDate}&endDate=${range.endDate}`,
        ),

    goals: () => request<GoalSummary[]>('/planning/dashboard'),
};
