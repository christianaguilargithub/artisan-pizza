import api from '../api';
import type { DailyReport } from '@/types';

export const reportService = {
  async getDaily(date?: string): Promise<DailyReport> {
    const params = date ? `?date=${date}` : '';
    const { data } = await api.get<DailyReport>(`/reports/daily${params}`);
    return data;
  },
};
