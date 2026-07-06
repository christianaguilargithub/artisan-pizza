import api from '../api';
import type { Role } from '@/types';

export const roleService = {
  async getAll(): Promise<Role[]> {
    const { data } = await api.get<Role[]>('/roles');
    return data;
  },

  async getById(id: number): Promise<Role> {
    const { data } = await api.get<Role>(`/roles/${id}`);
    return data;
  },

  async create(name: string): Promise<Role> {
    const { data } = await api.post<Role>('/roles', { name });
    return data;
  },

  async update(id: number, name: string): Promise<Role> {
    const { data } = await api.put<Role>(`/roles/${id}`, { name });
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/roles/${id}`);
  },
};
