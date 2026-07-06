'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const cards = [
  { title: 'Orders', href: '/dashboard/orders', emoji: '📋', desc: 'Manage and track all orders' },
  { title: 'Kitchen Queue', href: '/dashboard/queue', emoji: '🔥', desc: 'Live order queue for kitchen staff' },
  { title: 'Products', href: '/dashboard/products', emoji: '🍕', desc: 'Add and manage menu items' },
  { title: 'Categories', href: '/dashboard/categories', emoji: '🗂️', desc: 'Organize product categories' },
  { title: 'Inventory', href: '/dashboard/inventory', emoji: '📦', desc: 'Track ingredients and stock' },
  { title: 'Payments', href: '/dashboard/payments', emoji: '💳', desc: 'View payment records' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">
        Welcome back, <span className="font-semibold">{user?.name}</span> — {user?.role?.name}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition flex flex-col gap-2"
          >
            <span className="text-3xl">{card.emoji}</span>
            <h2 className="text-lg font-semibold text-gray-800">{card.title}</h2>
            <p className="text-sm text-gray-500">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
