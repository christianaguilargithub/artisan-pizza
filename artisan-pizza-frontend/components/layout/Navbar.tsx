'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-red-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link href="/dashboard" className="text-xl font-bold tracking-wide">
        🍕 Artisan Pizza
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link href="/dashboard/orders" className="hover:underline">Orders</Link>
        <Link href="/dashboard/queue" className="hover:underline">Queue</Link>
        <Link href="/dashboard/products" className="hover:underline">Products</Link>
        <Link href="/dashboard/inventory" className="hover:underline">Inventory</Link>
        <Link href="/dashboard/categories" className="hover:underline">Categories</Link>
        <Link href="/dashboard/payments" className="hover:underline">Payments</Link>
        {user && (
          <>
            <span className="opacity-75">Hi, {user.name}</span>
            <button onClick={handleLogout} className="bg-white text-red-700 px-3 py-1 rounded font-semibold hover:bg-red-50">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
