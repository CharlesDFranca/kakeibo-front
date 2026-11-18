import { useAsyncData } from '@/shared/hooks/useAsyncData';
import { transfersApi, type TransferStatus } from '../api/transfers.api';

export const useTransfers = (status: TransferStatus | '') =>
    useAsyncData(() => transfersApi.list(status || undefined), [status]);
