'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { orderService } from '@/lib/services/orderService';
import { productService } from '@/lib/services/productService';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '@/components/ui/Pagination';
import type { Order, OrderStatus, PaginatedResponse, Product } from '@/types';

type OrderSource = 'dine-in' | 'online' | 'walk-in';

export default function CashierOrderPage() {
  const [data, setData] = useState<PaginatedResponse<Order> | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSource, setOrderSource] = useState<OrderSource>('dine-in');
  const [cartItems, setCartItems] = useState<{ product_id: number; quantity: number }[]>([]);

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

  const addToCart = (productId: number) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product_id === productId);
      return existing
        ? prev.map((i) => i.product_id === productId ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { product_id: productId, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i.product_id !== productId));
    } else {
      setCartItems((prev) => prev.map((i) => i.product_id === productId ? { ...i, quantity } : i));
    }
  };

  const clearCart = () => setCartItems([]);

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    await orderService.create({ order_source: orderSource, items: cartItems });
    clearCart();
    await load();
    setSubmitting(false);
  };

  const handleStatus = async (id: number, status: OrderStatus) => {
    await orderService.updateStatus(id, status);
    await load();
  };

  const statusOptions: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

  const cartTotal = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product_id);
    return sum + (product ? Number(product.price) * item.quantity : 0);
  }, 0);

  return (
    <div className="flex h-[calc(100vh-56px)] bg-gray-50 overflow-hidden">
      {/* POS Menu Section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">Menu</h1>
          <select
            value={orderSource}
            onChange={(e) => setOrderSource(e.target.value as OrderSource)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="dine-in">Dine-In</option>
            <option value="online">Online</option>
            <option value="walk-in">Walk-In</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product.id)}
              className="bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:shadow-md hover:border-red-300 transition select-none"
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">🍕</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">{product.name}</h3>
              <p className="text-red-600 font-bold text-sm">₱{Number(product.price).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Queue #</th>
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-sm">
                        No orders yet.
                      </td>
                    </tr>
                  )}
                  {data?.data.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-red-700">#{order.queue_number}</td>
                      <td className="px-4 py-3 capitalize text-gray-500">{order.order_source}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3">₱{Number(order.total_amount).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatus(order.id, e.target.value as OrderStatus)}
                          className="border rounded px-2 py-1 text-xs focus:outline-none"
                        >
                          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={data!.current_page} lastPage={data!.last_page} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Cart / Order Summary Sidebar */}
      <div className="w-72 bg-white border-l shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cartItems.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Cart is empty</p>
          ) : (
            cartItems.map((item) => {
              const product = products.find((p) => p.id === item.product_id);
              if (!product) return null;
              return (
                <div key={product.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">₱{Number(product.price).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full border text-xs flex items-center justify-center hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border text-xs flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Total + Actions */}
        <div className="p-6 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="font-bold text-xl text-red-600">₱{cartTotal.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            <button
              onClick={handleCreateOrder}
              disabled={submitting || cartItems.length === 0}
              className="w-full bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing…' : 'Place Order'}
            </button>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
