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
    image?: File | null;
  }): Promise<Product> {
    const form = new FormData();
    form.append('category_id', String(payload.category_id));
    form.append('name', payload.name);
    form.append('price', String(payload.price));
    if (payload.image) form.append('image', payload.image);
    const { data } = await api.post<Product>('/products', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async update(
    id: number,
    payload: Partial<{ category_id: number; name: string; price: number; image: File | null }>
  ): Promise<Product> {
    const form = new FormData();
    if (payload.category_id !== undefined) form.append('category_id', String(payload.category_id));
    if (payload.name !== undefined) form.append('name', payload.name);
    if (payload.price !== undefined) form.append('price', String(payload.price));
    if (payload.image) form.append('image', payload.image);
    // Laravel needs this to treat POST as PUT for multipart
    form.append('_method', 'PUT');
    const { data } = await api.post<Product>(`/products/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
