'use client';

import { useEffect, useState } from 'react';
import { discountService } from '@/lib/services/discountService';
import Modal from '@/components/ui/Modal';
import type { Discount } from '@/types';

interface DiscountForm {
  name: string;
  promo_code: string;
  type: 'fixed' | 'percent';
  value: string;
  usage_limit: string;
  is_active: boolean;
  expires_at: string;
}

const emptyForm: DiscountForm = {
  name: '', promo_code: '', type: 'percent', value: '', usage_limit: '', is_active: true, expires_at: '',
};

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Discount | null>(null);
  const [form, setForm] = useState<DiscountForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setDiscounts(await discountService.getAll());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditTarget(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (d: Discount) => {
    setEditTarget(d);
    setForm({
      name: d.name,
      promo_code: d.promo_code,
      type: d.type,
      value: String(d.value),
      usage_limit: d.usage_limit ? String(d.usage_limit) : '',
      is_active: d.is_active,
      expires_at: d.expires_at ? d.expires_at.slice(0, 10) : '',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditTarget(null); setForm(emptyForm); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: form.name,
      promo_code: form.promo_code.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      is_active: form.is_active,
      expires_at: form.expires_at || null,
    };
    if (editTarget) {
      await discountService.update(editTarget.id, payload);
    } else {
      await discountService.create(payload);
    }
    closeModal();
    await load();
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this discount?')) return;
    await discountService.delete(id);
    await load();
  };

  const handleToggle = async (d: Discount) => {
    await discountService.update(d.id, { is_active: !d.is_active });
    await load();
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promo codes and discount rules</p>
        </div>
        <button onClick={openAdd} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700">
          + New Discount
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Value</th>
                <th className="px-4 py-3 text-left">Usage</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {discounts.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No discounts yet.</td></tr>
              )}
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">{d.promo_code}</span>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-500">{d.type}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">
                    {d.type === 'percent' ? `${d.value}%` : `₱${Number(d.value).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {d.usage_count}{d.usage_limit ? `/${d.usage_limit}` : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {d.expires_at ? new Date(d.expires_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(d)} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {d.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(d)} className="text-blue-600 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? 'Edit Discount' : 'New Discount'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus placeholder="e.g. Student Discount" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Promo Code</label>
                <input value={form.promo_code} onChange={(e) => setForm({ ...form, promo_code: e.target.value.toUpperCase() })} required placeholder="e.g. SAVE20" className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'fixed' | 'percent' })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed (₱)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Value</label>
                <input type="number" step="0.01" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required placeholder={form.type === 'percent' ? '20' : '50.00'} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Max Uses (optional)</label>
                <input type="number" min="1" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Unlimited" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Expires At (optional)</label>
                <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
              <span className="text-gray-700">Active</span>
            </label>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={closeModal} className="border px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={submitting} className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                {submitting ? 'Saving…' : editTarget ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
