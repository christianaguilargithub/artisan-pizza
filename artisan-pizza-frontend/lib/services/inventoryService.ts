import api from '../api';
import type { InventoryItem, PaginatedResponse } from '@/types';

export const inventoryService = {
  async getAll(page = 1): Promise<PaginatedResponse<InventoryItem>> {
    const { data } = await api.get<PaginatedResponse<InventoryItem>>(`/inventory-items?page=${page}`);
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
  }): Promise<InventoryItem> {
    const { data } = await api.post<InventoryItem>('/inventory-items', payload);
    return data;
  },

  async update(
    id: number,
    payload: Partial<{ name: string; unit: string; quantity: number }>
  ): Promise<InventoryItem> {
    const { data } = await api.put<InventoryItem>(`/inventory-items/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/inventory-items/${id}`);
  },
};
