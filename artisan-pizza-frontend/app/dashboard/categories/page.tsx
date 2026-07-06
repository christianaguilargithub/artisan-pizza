'use client';

import { useEffect, useState } from 'react';
import { categoryService } from '@/lib/services/categoryService';
import Modal from '@/components/ui/Modal';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setCategories(await categoryService.getAll());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setName('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setName(cat.name);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (editTarget) {
      await categoryService.update(editTarget.id, { name });
    } else {
      await categoryService.create({ name });
    }
    closeModal();
    await load();
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    await categoryService.delete(id);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Categories</h1>
        <button
          onClick={openAdd}
          className="bg-red-700 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-red-800"
        >
          + Add Category
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Created By</th>
                <th className="px-4 py-3 text-left">Products</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">
                    No categories yet.
                  </td>
                </tr>
              )}
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.author}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.products_count ?? 0}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(cat)} className="text-blue-600 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal
          title={editTarget ? 'Edit Category' : 'Add Category'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                placeholder="e.g. Pizzas, Drinks…"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="border px-4 py-1.5 rounded text-sm hover:bg-gray-50"
              >
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
