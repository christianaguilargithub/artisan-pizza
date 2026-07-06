'use client';

import { useEffect, useState } from 'react';
import { orderService } from '@/lib/services/orderService';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Order, OrderStatus } from '@/types';

export default function QueuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const queue = await orderService.getQueue();
    setOrders(queue);
    setLoading(false);
  };

  // Poll every 10 seconds for live updates
  useEffect(() => {
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, []);

  const handleStatus = async (id: number, status: OrderStatus) => {
    await orderService.updateStatus(id, status);
    await load();
  };

  const grouped: Record<string, Order[]> = {
    pending:   orders.filter((o) => o.status === 'pending'),
    preparing: orders.filter((o) => o.status === 'preparing'),
    ready:     orders.filter((o) => o.status === 'ready'),
  };

  const columnColors: Record<string, string> = {
    pending:   'border-yellow-400',
    preparing: 'border-blue-400',
    ready:     'border-green-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Kitchen Queue</h1>
        <button onClick={load} className="text-sm text-gray-500 border rounded px-3 py-1 hover:bg-gray-50">
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading queue…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['pending', 'preparing', 'ready'] as OrderStatus[]).map((status) => (
            <div key={status}>
              <h2 className={`text-sm font-semibold uppercase tracking-wide mb-3 border-b-2 pb-2 ${columnColors[status]}`}>
                {status} ({grouped[status].length})
              </h2>
              <div className="space-y-3">
                {grouped[status].length === 0 && (
                  <p className="text-gray-400 text-sm italic">No orders</p>
                )}
                {grouped[status].map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-red-700 text-lg">
                        #{order.queue_number}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-gray-400 capitalize mb-3">{order.order_source}</p>

                    <ul className="space-y-1 mb-4">
                      {order.order_items?.map((item) => (
                        <li key={item.id} className="text-sm flex justify-between">
                          <span>{item.product?.name ?? `Product #${item.product_id}`}</span>
                          <span className="font-semibold text-gray-600">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex gap-2 flex-wrap">
                      {status === 'pending' && (
                        <button
                          onClick={() => handleStatus(order.id, 'preparing')}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Start Preparing
                        </button>
                      )}
                      {status === 'preparing' && (
                        <button
                          onClick={() => handleStatus(order.id, 'ready')}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Mark Ready
                        </button>
                      )}
                      {status === 'ready' && (
                        <button
                          onClick={() => handleStatus(order.id, 'completed')}
                          className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleStatus(order.id, 'cancelled')}
                        className="text-xs border border-red-300 text-red-600 px-3 py-1 rounded hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
