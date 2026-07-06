'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { productService } from '@/lib/services/productService';
import { categoryService } from '@/lib/services/categoryService';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import type { Category, PaginatedResponse, Product } from '@/types';

interface ProductForm {
  category_id: number;
  name: string;
  price: string;
  image: File | null;
  previewUrl: string | null;
}

const emptyForm: ProductForm = { category_id: 0, name: '', price: '', image: null, previewUrl: null };

export default function ProductsPage() {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [products, cats] = await Promise.all([
      productService.getAll(page),
      categoryService.getAll(),
    ]);
    setData(products);
    setCategories(cats);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditTarget(p);
    setForm({
      category_id: p.category_id,
      name: p.name,
      price: String(p.price),
      image: null,
      previewUrl: p.image_url ?? null,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (form.previewUrl && form.image) URL.revokeObjectURL(form.previewUrl);
    setShowModal(false);
    setEditTarget(null);
    setForm(emptyForm);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (form.previewUrl && form.image) URL.revokeObjectURL(form.previewUrl);
    setForm((f) => ({ ...f, image: file, previewUrl: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      category_id: Number(form.category_id),
      name: form.name,
      price: parseFloat(form.price),
      image: form.image,
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
                  <th className="px-4 py-3 text-left w-16">Image</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-sm">
                      No products yet.
                    </td>
                  </tr>
                )}
                {data?.data.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-300 text-xl">
                          🍕
                        </div>
                      )}
                    </td>
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
        <Modal title={editTarget ? 'Edit Product' : 'Add Product'} onClose={closeModal}>
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

            {/* Image upload */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Product Image <span className="text-gray-400">(optional, max 2MB)</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-red-400 transition"
              >
                {form.previewUrl ? (
                  <Image
                    src={form.previewUrl}
                    alt="Preview"
                    width={160}
                    height={160}
                    className="w-40 h-40 object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <span className="text-3xl">📷</span>
                    <span className="text-xs text-gray-400">Click to upload image</span>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {form.previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    if (form.image) URL.revokeObjectURL(form.previewUrl!);
                    setForm((f) => ({ ...f, image: null, previewUrl: editTarget?.image_url ?? null }));
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="mt-1 text-xs text-red-500 hover:underline"
                >
                  {form.image ? 'Remove new image' : 'Keep existing image'}
                </button>
              )}
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
