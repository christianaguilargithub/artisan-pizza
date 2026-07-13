'use client';

import { useCallback, useEffect, useState } from 'react';
import { inventoryService } from '@/lib/services/inventoryService';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import type { InventoryItem, PaginatedResponse } from '@/types';

interface InventoryForm {
  name: string;
  unit: string;
  quantity: string;
  low_stock_threshold: string;
}

const emptyForm: InventoryForm = { name: '', unit: '', quantity: '', low_stock_threshold: '' };

export default function InventoryPage() {
  const [data, setData] = useState<PaginatedResponse<InventoryItem> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [filterLowStock, setFilterLowStock] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setData(await inventoryService.getAll({ page, low_stock: filterLowStock || undefined }));
    setLoading(false);
  }, [page, filterLowStock]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditTarget(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item: InventoryItem) => {
    setEditTarget(item);
    setForm({ name: item.name, unit: item.unit, quantity: String(item.quantity), low_stock_threshold: String(item.low_stock_threshold ?? '') });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditTarget(null); setForm(emptyForm); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: form.name,
      unit: form.unit,
      quantity: parseFloat(form.quantity),
      low_stock_threshold: form.low_stock_threshold ? parseFloat(form.low_stock_threshold) : 0,
    };
    if (editTarget) {
      await inventoryService.update(editTarget.id, payload);
    } else {
      await inventoryService.create(payload);
    }
    closeModal();
    await load();
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this inventory item?')) return;
    await inventoryService.delete(id);
    await load();
  };

  const lowStockCount = data?.data.filter((i) => i.is_low_stock).length ?? 0;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Track ingredients and stock levels</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setFilterLowStock(!filterLowStock); setPage(1); }}
            className={`text-sm px-3 py-1.5 rounded-xl border font-medium transition ${filterLowStock ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            ⚠️ Low Stock {!filterLowStock && lowStockCount > 0 && <span className="ml-1 bg-red-100 text-red-700 px-1.5 rounded-full text-xs">{lowStockCount}</span>}
          </button>
          <button onClick={openAdd} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700">
            + Add Item
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Unit</th>
                  <th className="px-4 py-3 text-left">Quantity</th>
                  <th className="px-4 py-3 text-left">Low Stock At</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.data.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No inventory items yet.</td></tr>
                )}
                {data?.data.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-50 ${item.is_low_stock ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                    <td className="px-4 py-3 font-semibold">{Number(item.quantity).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {Number(item.low_stock_threshold) > 0 ? Number(item.low_stock_threshold).toFixed(2) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {item.is_low_stock ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">⚠️ Low Stock</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">OK</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline text-xs">Delete</button>
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
        <Modal title={editTarget ? 'Edit Item' : 'Add Item'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus placeholder="e.g. Mozzarella" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Unit</label>
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required placeholder="kg, pcs, liters" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Quantity</label>
                <input type="number" step="0.01" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required placeholder="0.00" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Low Stock Alert Threshold <span className="text-gray-400">(optional)</span></label>
              <input type="number" step="0.01" min="0" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} placeholder="e.g. 2.00 — alert when below this" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
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
