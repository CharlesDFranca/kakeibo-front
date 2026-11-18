import { useAsyncData } from '@/shared/hooks/useAsyncData';
import { walletsApi } from '../api/wallets.api';

export const useWallets = () => useAsyncData(walletsApi.list, []);
