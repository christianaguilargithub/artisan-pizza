import Cookies from 'js-cookie';
import api from '../api';
import type { AuthResponse, User } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    Cookies.set('token', data.token, { expires: 7 });
    return data;
  },

  async register(payload: {
    role_id: number;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    Cookies.set('token', data.token, { expires: 7 });
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    Cookies.remove('token');
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};
