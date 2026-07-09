'use client';

import { useEffect, useRef, useState } from 'react';
import { orderService } from '@/lib/services/orderService';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Order, OrderStatus } from '@/types';

function useElapsed(createdAt: string) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
      if (diff < 60) setElapsed(`${diff}s`);
      else if (diff < 3600) setElapsed(`${Math.floor(diff / 60)}m ${diff % 60}s`);
      else setElapsed(`${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return elapsed;
}

function OrderCard({ order, onStatus }: { order: Order; onStatus: (id: number, s: OrderStatus) => void }) {
  const elapsed = useElapsed(order.created_at!);
  const isUrgent = order.created_at && (Date.now() - new Date(order.created_at).getTime()) > 10 * 60 * 1000;

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-4 ${isUrgent ? 'border-red-300' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono font-bold text-red-700 text-xl">#{order.queue_number}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
            ⏱ {elapsed}
          </span>
          <StatusBadge status={order.status} />
        </div>
      </div>
      <p className="text-xs text-gray-400 capitalize mb-3">{order.order_source}</p>

      <ul className="space-y-1 mb-4">
        {order.order_items?.map((item) => (
          <li key={item.id} className="text-sm flex justify-between">
            <span className="text-gray-700">{item.product?.name ?? `Product #${item.product_id}`}</span>
            <span className="font-bold text-gray-600">×{item.quantity}</span>
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 mb-3">📝 {order.notes}</p>
      )}

      <div className="flex gap-2 flex-wrap">
        {order.status === 'pending' && (
          <button onClick={() => onStatus(order.id, 'preparing')} className="flex-1 text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium">
            Start Preparing
          </button>
        )}
        {order.status === 'preparing' && (
          <button onClick={() => onStatus(order.id, 'ready')} className="flex-1 text-xs bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 font-medium">
            Mark Ready
          </button>
        )}
        {order.status === 'ready' && (
          <button onClick={() => onStatus(order.id, 'completed')} className="flex-1 text-xs bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 font-medium">
            Complete
          </button>
        )}
        <button onClick={() => onStatus(order.id, 'cancelled')} className="text-xs border border-red-200 text-red-500 px-3 py-2 rounded-lg hover:bg-red-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

const columns: { status: OrderStatus; label: string; color: string; bg: string }[] = [
  { status: 'pending',   label: 'Pending',   color: 'border-yellow-400 text-yellow-700', bg: 'bg-yellow-50' },
  { status: 'preparing', label: 'Preparing', color: 'border-blue-400 text-blue-700',     bg: 'bg-blue-50' },
  { status: 'ready',     label: 'Ready',     color: 'border-green-400 text-green-700',   bg: 'bg-green-50' },
];

export default function QueuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const prevCountRef = useRef(0);

  const load = async () => {
    const queue = await orderService.getQueue();
    // Play sound if new orders arrived
    if (queue.length > prevCountRef.current && prevCountRef.current > 0) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch { /* ignore */ }
    }
    prevCountRef.current = queue.length;
    setOrders(queue);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, []);

  const handleStatus = async (id: number, status: OrderStatus) => {
    await orderService.updateStatus(id, status);
    await load();
  };

  const grouped = (status: OrderStatus) => orders.filter((o) => o.status === status);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kitchen Queue</h1>
          <p className="text-sm text-gray-500 mt-0.5">Auto-refreshes every 10 seconds</p>
        </div>
        <button onClick={load} className="text-sm text-gray-500 border rounded-lg px-4 py-2 hover:bg-gray-50 transition">
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading queue…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(({ status, label, color, bg }) => (
            <div key={status}>
              <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${color.split(' ')[0]}`}>
                <h2 className={`text-sm font-bold uppercase tracking-wide ${color.split(' ')[1]}`}>{label}</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg} ${color.split(' ')[1]}`}>
                  {grouped(status).length}
                </span>
              </div>
              <div className="space-y-3">
                {grouped(status).length === 0 && (
                  <div className={`rounded-xl border-2 border-dashed p-6 text-center ${bg}`}>
                    <p className="text-gray-400 text-sm">No orders</p>
                  </div>
                )}
                {grouped(status).map((order) => (
                  <OrderCard key={order.id} order={order} onStatus={handleStatus} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
