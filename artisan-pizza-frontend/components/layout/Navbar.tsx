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

  const navigation = {
    admin: [
      { href: '/dashboard/orders', label: 'Orders' },
      { href: '/dashboard/queue', label: 'Queue' },
      { href: '/dashboard/products', label: 'Products' },
      { href: '/dashboard/inventory', label: 'Inventory' },
      { href: '/dashboard/categories', label: 'Categories' },
      { href: '/dashboard/payments', label: 'Payments' },
      { href: '/dashboard/users', label: 'Users' },
    ],
    cashier: [
      { href: '/dashboard/orders', label: 'Orders' },
      // { href: '/dashboard/queue', label: 'Queue' },
      // { href: '/dashboard/payments', label: 'Payments' },
    ],
    kitchen: [
      { href: '/dashboard/orders', label: 'Orders' },
      { href: '/dashboard/queue', label: 'Queue' },
    ],
    customer: [],
  };

  const roleName = user?.role?.name?.toLowerCase() ?? 'customer';
  const links =
    navigation[roleName as keyof typeof navigation] ?? [];

  return (
    <nav className="bg-red-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link
        href="/dashboard"
        className="text-xl font-bold tracking-wide"
      >
        🍕 Artisan Pizza
      </Link>

      <div className="flex items-center gap-6 text-sm font-medium">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className="hover:underline">
            {label}
          </Link>
        ))}

        {user && (
          <>
            <span className="opacity-75">Hi, {user.name}</span>

            <button
              onClick={handleLogout}
              className="bg-white text-red-700 px-3 py-1 rounded font-semibold hover:bg-red-50"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}