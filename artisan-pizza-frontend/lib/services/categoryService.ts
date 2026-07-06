import api from '../api';
import type { Category } from '@/types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  async getById(id: number): Promise<Category> {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },

  async create(payload: { name: string }): Promise<Category> {
    const { data } = await api.post<Category>('/categories', payload);
    return data;
  },

  async update(id: number, payload: Partial<{ name: string }>): Promise<Category> {
    const { data } = await api.put<Category>(`/categories/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
