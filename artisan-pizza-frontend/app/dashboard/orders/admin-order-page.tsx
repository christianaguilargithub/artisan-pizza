'use client';

import { useCallback, useEffect, useState } from 'react';
import { orderService } from '@/lib/services/orderService';
import { productService } from '@/lib/services/productService';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '@/components/ui/Pagination';
import type { Order, OrderStatus, PaginatedResponse, Product } from '@/types';

type OrderSource = 'dine-in' | 'online' | 'walk-in';

export default function AdminOrderPage() {
  const [data, setData] = useState<PaginatedResponse<Order> | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSource, setOrderSource] = useState<OrderSource>('dine-in');
  const [items, setItems] = useState([{ product_id: 0, quantity: 1 }]);

  const load = useCallback(async () => {
    setLoading(true);
    const [orders, prods] = await Promise.all([
      orderService.getAll(page),
      productService.getAll(1).then((r) => r.data),
    ]);
    setData(orders);
    setProducts(prods);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openModal = () => { setOrderSource('dine-in'); setItems([{ product_id: 0, quantity: 1 }]); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setItems([{ product_id: 0, quantity: 1 }]); };

  const addItem = () => setItems([...items, { product_id: 0, quantity: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const changeItem = (i: number, field: string, value: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: Number(value) };
    setItems(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await orderService.create({ order_source: orderSource, items });
    closeModal();
    await load();
    setSubmitting(false);
  };

  const handleStatus = async (id: number, status: OrderStatus) => {
    await orderService.updateStatus(id, status);
    await load();
  };

  const handleRefund = async (id: number) => {
    if (!confirm('Refund this order? This will reverse inventory and mark the order as cancelled.')) return;
    await orderService.refund(id);
    await load();
  };

  const statusOptions: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

  const previewTotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product_id);
    return sum + (product ? Number(product.price) * item.quantity : 0);
  }, 0);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all orders and statuses</p>
        </div>
        <button onClick={openModal} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700">
          + New Order
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Queue #</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Discount</th>
                  <th className="px-4 py-3 text-left">Update Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.data.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No orders yet.</td></tr>
                )}
                {data?.data.map((order) => (
                  <tr key={order.id} className={`hover:bg-gray-50 ${order.refunded_at ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 font-mono font-bold text-red-700">#{order.queue_number}</td>
                    <td className="px-4 py-3 capitalize text-gray-500">{order.order_source}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 font-semibold">₱{Number(order.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-green-600 text-xs">
                      {order.discount ? (
                        <span className="font-mono bg-green-50 px-1.5 py-0.5 rounded">{order.discount.promo_code}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select value={order.status} onChange={(e) => handleStatus(order.id, e.target.value as OrderStatus)} className="border rounded-lg px-2 py-1 text-xs focus:outline-none">
                        {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {order.status === 'completed' && !order.refunded_at && (
                        <button onClick={() => handleRefund(order.id)} className="text-xs text-red-500 hover:underline">
                          Refund
                        </button>
                      )}
                      {order.refunded_at && <span className="text-xs text-gray-400">Refunded</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={data!.current_page} lastPage={data!.last_page} onPageChange={setPage} />
        </>
      )}

      {showModal && (
        <Modal title="New Order" onClose={closeModal}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Order Source</label>
              <select value={orderSource} onChange={(e) => setOrderSource(e.target.value as OrderSource)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                <option value="dine-in">Dine-In</option>
                <option value="online">Online</option>
                <option value="walk-in">Walk-In</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 block">Items</label>
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select value={item.product_id} onChange={(e) => changeItem(i, 'product_id', e.target.value)} required className="flex-1 border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                    <option value="">Select product…</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} — ₱{Number(p.price).toFixed(2)}</option>)}
                  </select>
                  <input type="number" min={1} value={item.quantity} onChange={(e) => changeItem(i, 'quantity', e.target.value)} required className="w-16 border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                  {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>}
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-blue-600 text-xs hover:underline">+ Add item</button>
            </div>

            {previewTotal > 0 && (
              <div className="bg-gray-50 rounded-xl px-4 py-2.5 flex justify-between text-sm">
                <span className="text-gray-500">Estimated Total</span>
                <span className="font-bold">₱{previewTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={closeModal} className="border px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={submitting} className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                {submitting ? 'Creating…' : 'Create Order'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
