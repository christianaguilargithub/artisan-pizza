import api from '../api';
import type { CreatePaymentPayload, PaginatedResponse, Payment } from '@/types';

export const paymentService = {
  async getAll(page = 1): Promise<PaginatedResponse<Payment>> {
    const { data } = await api.get<PaginatedResponse<Payment>>(`/payments?page=${page}`);
    return data;
  },

  async getById(id: number): Promise<Payment> {
    const { data } = await api.get<Payment>(`/payments/${id}`);
    return data;
  },

  async create(payload: CreatePaymentPayload): Promise<Payment> {
    const { data } = await api.post<Payment>('/payments', payload);
    return data;
  },

  async update(
    id: number,
    payload: Partial<{ payment_method: string; amount_tendered: number; qr_reference: string; status: string }>
  ): Promise<Payment> {
    const { data } = await api.put<Payment>(`/payments/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/payments/${id}`);
  },
};
