'use client';

import { useEffect, useState } from 'react';
import { productService } from '@/lib/services/productService';
import { categoryService } from '@/lib/services/categoryService';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import type { Category, PaginatedResponse, Product } from '@/types';

interface ProductForm {
  category_id: number;
  name: string;
  price: string;
}

const emptyForm: ProductForm = { category_id: 0, name: '', price: '' };

export default function ProductsPage() {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [products, cats] = await Promise.all([
      productService.getAll(page),
      categoryService.getAll(),
    ]);
    setData(products);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditTarget(p);
    setForm({ category_id: p.category_id, name: p.name, price: String(p.price) });
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
    const payload = {
      category_id: Number(form.category_id),
      name: form.name,
      price: parseFloat(form.price),
    };
    if (editTarget) {
      await productService.update(editTarget.id, payload);
    } else {
      await productService.create(payload);
    }
    closeModal();
    await load();
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await productService.delete(id);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Products</h1>
        <button
          onClick={openAdd}
          className="bg-red-700 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-red-800"
        >
          + Add Product
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
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">
                      No products yet.
                    </td>
                  </tr>
                )}
                {data?.data.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category?.name}</td>
                    <td className="px-4 py-3">₱{Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-xs">Delete</button>
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
          title={editTarget ? 'Edit Product' : 'Add Product'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
                placeholder="e.g. Margherita Pizza"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Price (₱)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
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
