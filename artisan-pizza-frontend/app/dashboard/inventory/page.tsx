'use client';

import { useEffect, useState } from 'react';
import { inventoryService } from '@/lib/services/inventoryService';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import type { InventoryItem, PaginatedResponse } from '@/types';

interface InventoryForm {
  name: string;
  unit: string;
  quantity: string;
}

const emptyForm: InventoryForm = { name: '', unit: '', quantity: '' };

export default function InventoryPage() {
  const [data, setData] = useState<PaginatedResponse<InventoryItem> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setData(await inventoryService.getAll(page));
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditTarget(item);
    setForm({ name: item.name, unit: item.unit, quantity: String(item.quantity) });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { name: form.name, unit: form.unit, quantity: parseFloat(form.quantity) };
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Inventory Items</h1>
        <button
          onClick={openAdd}
          className="bg-red-700 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-red-800"
        >
          + Add Item
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
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Unit</th>
                  <th className="px-4 py-3 text-left">Quantity</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">
                      No inventory items yet.
                    </td>
                  </tr>
                )}
                {data?.data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
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
        <Modal
          title={editTarget ? 'Edit Inventory Item' : 'Add Inventory Item'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
                placeholder="e.g. Mozzarella"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                required
                placeholder="e.g. kg, pcs, liters"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
                placeholder="0.00"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={closeModal} className="border px-4 py-1.5 rounded text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-700 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-red-800 disabled:opacity-50"
              >
                {submitting ? 'Saving…' : editTarget ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
