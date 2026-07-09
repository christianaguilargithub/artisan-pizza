'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const adminNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/dashboard/orders', label: 'Orders', icon: '📋' },
  { href: '/dashboard/queue', label: 'Kitchen Queue', icon: '🔥' },
  { href: '/dashboard/products', label: 'Products', icon: '🍕' },
  { href: '/dashboard/categories', label: 'Categories', icon: '🗂️' },
  { href: '/dashboard/inventory', label: 'Inventory', icon: '📦' },
  { href: '/dashboard/payments', label: 'Payments', icon: '💳' },
  { href: '/dashboard/discounts', label: 'Discounts', icon: '🏷️' },
  { href: '/dashboard/shifts', label: 'Shifts', icon: '🕐' },
  { href: '/dashboard/reports', label: 'Reports', icon: '📊' },
];

const cashierNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/dashboard/orders', label: 'POS', icon: '🛒' },
  { href: '/dashboard/shifts', label: 'My Shift', icon: '🕐' },
];

const kitchenNav: NavItem[] = [
  { href: '/dashboard/queue', label: 'Kitchen Queue', icon: '🔥' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const roleName = user?.role?.name?.toLowerCase() ?? 'customer';
  const navItems =
    roleName === 'admin' ? adminNav :
    roleName === 'cashier' ? cashierNav :
    roleName === 'kitchen' ? kitchenNav : [];

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🍕</span>
          <div>
            <p className="font-bold text-sm leading-tight">Artisan Pizza</p>
            <p className="text-xs text-gray-400">POS System</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(href)
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-base w-5 text-center">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.name}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-gray-400 hover:text-red-400 transition px-1 py-1"
        >
          → Sign out
        </button>
      </div>
    </aside>
  );
}
