import api from '../api';
import type { CreatePaymentPayload, PaginatedResponse, Payment, ReceiptData } from '@/types';

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
    const { data } = await api.post<Payment | { data: Payment }>('/payments', payload);
    const payment = 'data' in data ? data.data : data;
    if (!Number.isFinite(Number(payment.id))) {
      throw new Error('Payment API response did not include a valid payment ID.');
    }
    return payment;
  },

  async getReceipt(id: number): Promise<ReceiptData> {
    if (!Number.isFinite(Number(id))) {
      throw new Error('Cannot load receipt without a valid payment ID.');
    }
    const { data } = await api.get<ReceiptData | { data: ReceiptData }>(`/payments/${id}/receipt`);
    return 'data' in data ? data.data : data;
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
