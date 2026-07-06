import api from '../api';
import type { PaginatedResponse, Product } from '@/types';

export const productService = {
  async getAll(page = 1): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get<PaginatedResponse<Product>>(`/products?page=${page}`);
    return data;
  },

  async getById(id: number): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async create(payload: {
    category_id: number;
    name: string;
    price: number;
  }): Promise<Product> {
    const { data } = await api.post<Product>('/products', payload);
    return data;
  },

  async update(
    id: number,
    payload: Partial<{ category_id: number; name: string; price: number }>
  ): Promise<Product> {
    const { data } = await api.put<Product>(`/products/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async attachInventory(
    productId: number,
    payload: { inventory_item_id: number; qty_used: number }
  ): Promise<Product> {
    const { data } = await api.post<Product>(`/products/${productId}/inventory`, payload);
    return data;
  },

  async detachInventory(productId: number, inventoryItemId: number): Promise<void> {
    await api.delete(`/products/${productId}/inventory/${inventoryItemId}`);
  },
};
