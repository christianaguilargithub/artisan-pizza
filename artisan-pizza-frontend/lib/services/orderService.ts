import api from '../api';
import type { Order, OrderStatus, PaginatedResponse } from '@/types';

export interface CreateOrderPayload {
  order_source: 'dine-in' | 'online' | 'walk-in';
  items: { product_id: number; quantity: number }[];
}

export const orderService = {
  async getAll(page = 1): Promise<PaginatedResponse<Order>> {
    const { data } = await api.get<PaginatedResponse<Order>>(`/orders?page=${page}`);
    return data;
  },

  async getById(id: number): Promise<Order> {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  async getQueue(): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/orders/queue');
    return data;
  },

  async create(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post<Order>('/orders', payload);
    return data;
  },

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/orders/${id}`);
  },
};
