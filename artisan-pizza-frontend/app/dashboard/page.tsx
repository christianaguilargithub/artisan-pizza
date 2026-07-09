'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { reportService } from '@/lib/services/reportService';
import { shiftService } from '@/lib/services/shiftService';
import type { DailyReport, Shift } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [shift, setShift] = useState<Shift | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);

  useEffect(() => {
    reportService.getDaily().then(setReport).finally(() => setLoadingReport(false));
    shiftService.getCurrent().then(setShift).catch(() => setShift(null));
  }, []);

  const statCards = [
    {
      label: "Today's Sales",
      value: report ? `₱${Number(report.total_sales).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—',
      icon: '💰',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
    },
    {
      label: 'Orders Today',
      value: report ? String(report.total_orders) : '—',
      icon: '📋',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
    },
    {
      label: 'Avg Order Value',
      value: report ? `₱${Number(report.avg_order_value).toFixed(2)}` : '—',
      icon: '📈',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-700',
    },
    {
      label: 'Low Stock Items',
      value: report ? String(report.low_stock_items.length) : '—',
      icon: '⚠️',
      color: report?.low_stock_items.length ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200',
      textColor: report?.low_stock_items.length ? 'text-red-700' : 'text-gray-700',
    },
  ];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, <span className="font-semibold text-gray-700">{user?.name}</span>
          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium capitalize">
            {user?.role?.name}
          </span>
        </p>
      </div>

      {/* Shift banner */}
      {user?.role?.name === 'cashier' && (
        <div className={`mb-6 rounded-xl border px-5 py-4 flex items-center justify-between ${
          shift ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{shift ? '🟢' : '🟡'}</span>
            <div>
              <p className={`font-semibold text-sm ${shift ? 'text-green-800' : 'text-yellow-800'}`}>
                {shift ? 'Shift is Open' : 'No Active Shift'}
              </p>
              <p className="text-xs text-gray-500">
                {shift
                  ? `Opened at ${new Date(shift.opened_at).toLocaleTimeString()} · Opening cash: ₱${Number(shift.opening_cash).toFixed(2)}`
                  : 'Open a shift before processing orders'}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/shifts"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-current hover:opacity-80 transition"
          >
            {shift ? 'Manage Shift' : 'Open Shift'}
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl border p-5 ${card.color}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${card.textColor}`}>
              {loadingReport ? <span className="animate-pulse">…</span> : card.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        {report && report.top_products.length > 0 && (
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4 text-sm">🏆 Top Products Today</h2>
            <div className="space-y-3">
              {report.top_products.map((p, i) => (
                <div key={p.product_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <span className="text-sm text-gray-700">{p.product_name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{p.quantity} sold</p>
                    <p className="text-xs text-gray-400">₱{Number(p.revenue).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment breakdown */}
        {report && Object.keys(report.by_payment_method).length > 0 && (
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4 text-sm">💳 Payment Methods Today</h2>
            <div className="space-y-3">
              {Object.entries(report.by_payment_method).map(([method, info]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-700">
                    {method === 'qr' ? 'QR Code' : method}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">₱{Number(info.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{info.count} transactions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low stock alert */}
        {report && report.low_stock_items.length > 0 && (
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5">
            <h2 className="font-semibold text-red-700 mb-4 text-sm">⚠️ Low Stock Alerts</h2>
            <div className="space-y-2">
              {report.low_stock_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-xs font-semibold text-red-600">
                    {Number(item.quantity).toFixed(2)} {item.unit} left
                  </span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/inventory" className="mt-3 block text-xs text-red-600 hover:underline">
              Manage inventory →
            </Link>
          </div>
        )}

        {/* Order status breakdown */}
        {report && Object.keys(report.status_breakdown).length > 0 && (
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4 text-sm">📊 Order Status Today</h2>
            <div className="space-y-2">
              {Object.entries(report.status_breakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-700">{status}</span>
                  <span className="text-sm font-semibold text-gray-800">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
