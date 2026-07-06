'use client';

import { useCallback, useEffect, useState } from 'react';
import { paymentService } from '@/lib/services/paymentService';
import { orderService } from '@/lib/services/orderService';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '@/components/ui/Pagination';
import type { Order, PaginatedResponse, Payment, PaymentMethod } from '@/types';

interface PaymentForm {
  order_id: string;
  payment_method: PaymentMethod;
  amount_tendered: string;
  qr_reference: string;
}

const emptyForm: PaymentForm = {
  order_id: '',
  payment_method: 'cash',
  amount_tendered: '',
  qr_reference: '',
};

export default function PaymentsPage() {
  const [data, setData] = useState<PaginatedResponse<Payment> | null>(null);
  const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PaymentForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [payments, queue] = await Promise.all([
      paymentService.getAll(page),
      orderService.getQueue(),
    ]);
    setData(payments);
    setUnpaidOrders(queue.filter((o) => o.status !== 'completed' && o.status !== 'cancelled'));
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openModal = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await paymentService.create({
      order_id: Number(form.order_id),
      payment_method: form.payment_method,
      amount_tendered: parseFloat(form.amount_tendered),
      qr_reference: form.qr_reference || undefined,
    });
    closeModal();
    await load();
    setSubmitting(false);
  };

  const selectedOrder = unpaidOrders.find((o) => o.id === Number(form.order_id));
  const change =
    selectedOrder && form.amount_tendered
      ? Math.max(0, parseFloat(form.amount_tendered) - Number(selectedOrder.total_amount))
      : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Payments</h1>
        <button
          onClick={openModal}
          className="bg-red-700 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-red-800"
        >
          + Process Payment
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Order #</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Tendered</th>
                  <th className="px-4 py-3 text-left">Change</th>
                  <th className="px-4 py-3 text-left">QR Ref</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400 text-sm">
                      No payments yet.
                    </td>
                  </tr>
                )}
                {data?.data.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-red-700">
                      #{payment.order?.queue_number ?? payment.order_id}
                    </td>
                    <td className="px-4 py-3 capitalize">{payment.payment_method}</td>
                    <td className="px-4 py-3">₱{Number(payment.amount_tendered).toFixed(2)}</td>
                    <td className="px-4 py-3">₱{Number(payment.change_given).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{payment.qr_reference ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : '—'}
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
        <Modal title="Process Payment" onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Select Order</label>
              <select
                value={form.order_id}
                onChange={(e) => setForm({ ...form, order_id: e.target.value })}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="">Choose an order…</option>
                {unpaidOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.queue_number} — ₱{Number(o.total_amount).toFixed(2)} ({o.status})
                  </option>
                ))}
              </select>
            </div>

            {selectedOrder && (
              <div className="bg-red-50 rounded-lg px-3 py-2 text-sm flex justify-between">
                <span className="text-gray-500">Order Total</span>
                <span className="font-bold text-red-700">₱{Number(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
              <div className="flex gap-2">
                {(['cash', 'qr', 'card'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setForm({ ...form, payment_method: method })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition capitalize ${
                      form.payment_method === method
                        ? 'bg-red-700 text-white border-red-700'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {method === 'qr' ? 'QR Code' : method.charAt(0).toUpperCase() + method.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount Tendered (₱)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount_tendered}
                onChange={(e) => setForm({ ...form, amount_tendered: e.target.value })}
                required
                placeholder="0.00"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            {change !== null && (
              <div className="bg-green-50 rounded-lg px-3 py-2 text-sm flex justify-between">
                <span className="text-gray-500">Change</span>
                <span className="font-bold text-green-700">₱{change.toFixed(2)}</span>
              </div>
            )}

            {form.payment_method === 'qr' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">QR Reference</label>
                <input
                  type="text"
                  value={form.qr_reference}
                  onChange={(e) => setForm({ ...form, qr_reference: e.target.value })}
                  placeholder="GCash / Maya reference number"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={closeModal} className="border px-4 py-1.5 rounded text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-700 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-red-800 disabled:opacity-50"
              >
                {submitting ? 'Processing…' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
