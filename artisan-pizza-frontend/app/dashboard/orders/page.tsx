'use client';

import { useAuth } from '@/context/AuthContext';
import AdminOrderPage from './admin-order-page';
import CashierOrderPage from './cashier-order-page';

export default function OrdersPage() {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return user.role?.name === 'admin' ? <AdminOrderPage /> : <CashierOrderPage />;
}
