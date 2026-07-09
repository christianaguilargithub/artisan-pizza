import api from '../api';
import type { InventoryItem, PaginatedResponse } from '@/types';

export const inventoryService = {
  async getAll(params?: { page?: number; search?: string; low_stock?: boolean }): Promise<PaginatedResponse<InventoryItem>> {
    const p = new URLSearchParams();
    if (params?.page) p.set('page', String(params.page));
    if (params?.search) p.set('search', params.search);
    if (params?.low_stock) p.set('low_stock', '1');
    const { data } = await api.get<PaginatedResponse<InventoryItem>>(`/inventory-items?${p.toString()}`);
    return data;
  },

  async getById(id: number): Promise<InventoryItem> {
    const { data } = await api.get<InventoryItem>(`/inventory-items/${id}`);
    return data;
  },

  async create(payload: {
    name: string;
    unit: string;
    quantity: number;
    low_stock_threshold?: number;
  }): Promise<InventoryItem> {
    const { data } = await api.post<InventoryItem>('/inventory-items', payload);
    return data;
  },

  async update(id: number, payload: Partial<{
    name: string;
    unit: string;
    quantity: number;
    low_stock_threshold: number;
  }>): Promise<InventoryItem> {
    const { data } = await api.put<InventoryItem>(`/inventory-items/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/inventory-items/${id}`);
  },
};
