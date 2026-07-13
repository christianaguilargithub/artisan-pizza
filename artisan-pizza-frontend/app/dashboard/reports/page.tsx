'use client';

import { useEffect, useState } from 'react';
import { reportService } from '@/lib/services/reportService';
import type { DailyReport } from '@/types';

export default function ReportsPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (d: string) => {
    setLoading(true);
    try {
      setReport(await reportService.getDaily(d));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(date); }, [date]);

  const statCards = report ? [
    { label: 'Total Sales', value: `₱${Number(report.total_sales).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, icon: '💰', color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'Total Orders', value: String(report.total_orders), icon: '📋', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Avg Order Value', value: `₱${Number(report.avg_order_value).toFixed(2)}`, icon: '📈', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { label: 'Low Stock Alerts', value: String(report.low_stock_items.length), icon: '⚠️', color: report.low_stock_items.length ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-700' },
  ] : [];

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Report</h1>
          <p className="text-sm text-gray-500 mt-1">Sales summary and performance metrics</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-gray-50 p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className={`rounded-xl border p-5 ${card.color.split(' ').slice(0, 2).join(' ')}`}>
                <span className="text-xl">{card.icon}</span>
                <p className={`text-2xl font-bold mt-2 ${card.color.split(' ')[2]}`}>{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {report.top_products.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-4">🏆 Top Products</h2>
                <div className="space-y-3">
                  {report.top_products.map((p, i) => (
                    <div key={p.product_id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">{p.product_name}</span>
                          <span className="text-sm font-semibold">{p.quantity} sold</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${(p.quantity / report.top_products[0].quantity) * 100}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">₱{Number(p.revenue).toFixed(2)} revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(report.by_payment_method).length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-4">💳 Payment Methods</h2>
                <div className="space-y-3">
                  {Object.entries(report.by_payment_method).map(([method, info]) => (
                    <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium capitalize">{method === 'qr' ? 'QR Code' : method}</p>
                        <p className="text-xs text-gray-400">{info.count} transactions</p>
                      </div>
                      <p className="font-bold text-gray-800">₱{Number(info.amount).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(report.status_breakdown).length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-4">📊 Order Status Breakdown</h2>
                <div className="space-y-2">
                  {Object.entries(report.status_breakdown).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm capitalize text-gray-600">{status}</span>
                      <span className="font-semibold text-gray-800">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.low_stock_items.length > 0 && (
              <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5">
                <h2 className="font-semibold text-red-700 mb-4">⚠️ Low Stock Items</h2>
                <div className="space-y-2">
                  {report.low_stock_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="text-xs font-semibold text-red-600">{Number(item.quantity).toFixed(2)} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-gray-400 text-sm">No data for this date.</p>
      )}
    </div>
  );
}
