import api from '../api';
import type { PaginatedResponse, Shift } from '@/types';

export const shiftService = {
  async getAll(page = 1): Promise<PaginatedResponse<Shift>> {
    const { data } = await api.get<PaginatedResponse<Shift>>(`/shifts?page=${page}`);
    return data;
  },

  async getCurrent(): Promise<Shift | null> {
    const { data } = await api.get<Shift | null>('/shifts/current');
    return data;
  },

  async open(payload: { opening_cash: number; notes?: string }): Promise<Shift> {
    const { data } = await api.post<Shift>('/shifts/open', payload);
    return data;
  },

  async close(id: number, payload: { closing_cash: number; notes?: string }): Promise<Shift> {
    const { data } = await api.post<Shift>(`/shifts/${id}/close`, payload);
    return data;
  },

  async getById(id: number): Promise<Shift> {
    const { data } = await api.get<Shift>(`/shifts/${id}`);
    return data;
  },
};
