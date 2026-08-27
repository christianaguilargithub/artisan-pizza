import api from '../api';
import type { User } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<{ user: User }> {
    // Calls the Next.js API route which sets an httpOnly cookie
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw { response: { data: err, status: res.status } };
    }

    return res.json();
  },

  async logout(): Promise<void> {
    // Calls the Next.js API route which clears the httpOnly cookie
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};
