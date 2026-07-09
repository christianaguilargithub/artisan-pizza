import api from '../api';
import type { Discount } from '@/types';

export const discountService = {
  async getAll(): Promise<Discount[]> {
    const { data } = await api.get<Discount[]>('/discounts');
    return data;
  },

  async create(payload: {
    name: string;
    promo_code: string;
    type: 'fixed' | 'percent';
    value: number;
    usage_limit?: number | null;
    is_active?: boolean;
    expires_at?: string | null;
  }): Promise<Discount> {
    const { data } = await api.post<Discount>('/discounts', payload);
    return data;
  },

  async update(id: number, payload: Partial<{
    name: string;
    promo_code: string;
    type: 'fixed' | 'percent';
    value: number;
    usage_limit: number | null;
    is_active: boolean;
    expires_at: string | null;
  }>): Promise<Discount> {
    const { data } = await api.put<Discount>(`/discounts/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/discounts/${id}`);
  },

  async validate(code: string): Promise<Discount> {
    const { data } = await api.post<Discount>('/discounts/validate', { code });
    return data;
  },
};
