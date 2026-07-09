'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { orderService } from '@/lib/services/orderService';
import { productService } from '@/lib/services/productService';
import { categoryService } from '@/lib/services/categoryService';
import { discountService } from '@/lib/services/discountService';
import { paymentService } from '@/lib/services/paymentService';
import ReceiptModal from '@/components/ui/ReceiptModal';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '@/components/ui/Pagination';
import type { Category, Discount, Order, OrderSource, OrderStatus, PaginatedResponse, Product, ReceiptData } from '@/types';

type PaymentMethod = 'cash' | 'qr' | 'card';

interface CartItem {
  product_id: number;
  quantity: number;
}

export default function CashierOrderPage() {
  const [data, setData] = useState<PaginatedResponse<Order> | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSource, setOrderSource] = useState<OrderSource>('dine-in');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');

  // Discount
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  // Payment modal
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [qrReference, setQrReference] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  // Receipt
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [orders, prods, cats] = await Promise.all([
      orderService.getAll(page),
      productService.getAll(1).then((r) => r.data),
      categoryService.getAll(),
    ]);
    setData(orders);
    setAllProducts(prods);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  // Filter products by category + search
  useEffect(() => {
    let filtered = allProducts;
    if (activeCat !== null) filtered = filtered.filter((p) => p.category_id === activeCat);
    if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    setProducts(filtered);
  }, [activeCat, search, allProducts]);

  const addToCart = (productId: number) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product_id === productId);
      return existing
        ? prev.map((i) => i.product_id === productId ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { product_id: productId, quantity: 1 }];
    });
  };

  const updateQty = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i.product_id !== productId));
    } else {
      setCartItems((prev) => prev.map((i) => i.product_id === productId ? { ...i, quantity } : i));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
    setNotes('');
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const p = allProducts.find((p) => p.id === item.product_id);
    return sum + (p ? Number(p.price) * item.quantity : 0);
  }, 0);

  const discountAmount = appliedDiscount ? appliedDiscount.computeDiscount?.(subtotal) ?? (
    appliedDiscount.type === 'percent'
      ? subtotal * (appliedDiscount.value / 100)
      : Math.min(appliedDiscount.value, subtotal)
  ) : 0;

  const cartTotal = subtotal - discountAmount;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setValidatingDiscount(true);
    setDiscountError('');
    try {
      const discount = await discountService.validate(discountCode.trim());
      setAppliedDiscount(discount);
    } catch {
      setDiscountError('Invalid or expired code.');
      setAppliedDiscount(null);
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    try {
      const order = await orderService.create({
        order_source: orderSource,
        items: cartItems,
        discount_code: appliedDiscount ? discountCode : undefined,
        notes: notes || undefined,
      });
      setPendingOrderId(order.id);
      setShowPayment(true);
      clearCart();
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!pendingOrderId) return;
    setSubmitting(true);
    try {
      const payment = await paymentService.create({
        order_id: pendingOrderId,
        payment_method: paymentMethod,
        amount_tendered: parseFloat(amountTendered) || cartTotal,
        qr_reference: qrReference || undefined,
      });
      const receiptData = await paymentService.getReceipt(payment.id);
      setReceipt(receiptData);
      setShowPayment(false);
      setPendingOrderId(null);
      setAmountTendered('');
      setQrReference('');
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const change = amountTendered && pendingOrderId
    ? Math.max(0, parseFloat(amountTendered) - cartTotal)
    : null;

  const handleStatus = async (id: number, status: OrderStatus) => {
    await orderService.updateStatus(id, status);
    await load();
  };

  const statusOptions: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

  return (
    <div className="flex h-[calc(100vh-48px)] -m-6 overflow-hidden">
      {/* Left: Menu */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b px-5 py-3 flex items-center gap-3">
          <select
            value={orderSource}
            onChange={(e) => setOrderSource(e.target.value as OrderSource)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="dine-in">🍽️ Dine-In</option>
            <option value="walk-in">🚶 Walk-In</option>
            <option value="online">📱 Online</option>
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu…"
            className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>

        {/* Category tabs */}
        <div className="bg-white border-b px-5 py-2 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveCat(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
              activeCat === null ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                activeCat === cat.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product.id)}
                className="bg-white rounded-xl border p-3 text-left hover:shadow-md hover:border-red-300 transition active:scale-95 select-none"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} width={120} height={120} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🍕</span>
                  )}
                </div>
                <p className="font-semibold text-gray-800 text-xs truncate">{product.name}</p>
                <p className="text-red-600 font-bold text-sm mt-0.5">₱{Number(product.price).toFixed(2)}</p>
              </button>
            ))}
            {products.length === 0 && (
              <p className="col-span-4 text-center text-gray-400 text-sm py-12">No products found.</p>
            )}
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Recent Orders</h2>
            </div>
            {loading ? (
              <p className="text-gray-400 text-sm p-4">Loading…</p>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Queue</th>
                      <th className="px-4 py-2 text-left">Source</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data?.data.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-sm">No orders yet.</td></tr>
                    )}
                    {data?.data.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-mono font-bold text-red-700">#{order.queue_number}</td>
                        <td className="px-4 py-2.5 capitalize text-gray-500 text-xs">{order.order_source}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-2.5 font-medium">₱{Number(order.total_amount).toFixed(2)}</td>
                        <td className="px-4 py-2.5">
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
                <div className="px-4 py-2">
                  <Pagination currentPage={data!.current_page} lastPage={data!.last_page} onPageChange={setPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-72 bg-white border-l flex flex-col shadow-lg">
        <div className="px-5 py-4 border-b">
          <h2 className="font-bold text-gray-800">Order Summary</h2>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">🛒</p>
              <p className="text-gray-400 text-sm">Cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => {
              const product = allProducts.find((p) => p.id === item.product_id);
              if (!product) return null;
              return (
                <div key={product.id} className="flex items-center gap-2 py-2 border-b">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">₱{Number(product.price).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(product.id, item.quantity - 1)} className="w-6 h-6 rounded-full border text-xs flex items-center justify-center hover:bg-gray-100">−</button>
                    <span className="text-sm w-5 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(product.id, item.quantity + 1)} className="w-6 h-6 rounded-full border text-xs flex items-center justify-center hover:bg-gray-100">+</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Discount + Notes */}
        {cartItems.length > 0 && (
          <div className="px-4 py-3 border-t space-y-2">
            <div className="flex gap-1">
              <input
                value={discountCode}
                onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); setAppliedDiscount(null); }}
                placeholder="Promo code"
                className="flex-1 border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button
                onClick={handleApplyDiscount}
                disabled={validatingDiscount || !discountCode}
                className="bg-gray-800 text-white text-xs px-3 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {discountError && <p className="text-red-500 text-xs">{discountError}</p>}
            {appliedDiscount && (
              <p className="text-green-600 text-xs font-medium">
                ✓ {appliedDiscount.name} — {appliedDiscount.type === 'percent' ? `${appliedDiscount.value}% off` : `₱${appliedDiscount.value} off`}
              </p>
            )}
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Order notes (optional)"
              className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        )}

        {/* Totals + Actions */}
        <div className="px-4 py-4 border-t">
          {appliedDiscount && (
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
          )}
          {appliedDiscount && (
            <div className="flex justify-between text-xs text-green-600 mb-1">
              <span>Discount</span>
              <span>-₱{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-gray-800">Total</span>
            <span className="font-bold text-xl text-red-600">₱{cartTotal.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            <button
              onClick={handlePlaceOrder}
              disabled={submitting || cartItems.length === 0}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Processing…' : 'Place Order'}
            </button>
            {cartItems.length > 0 && (
              <button onClick={clearCart} className="w-full border border-gray-200 text-gray-500 py-2 rounded-xl text-sm hover:bg-gray-50 transition">
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-gray-800">Process Payment</h2>
              <button onClick={() => setShowPayment(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-red-50 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-gray-600 text-sm">Amount Due</span>
                <span className="font-bold text-xl text-red-600">₱{cartTotal.toFixed(2)}</span>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'qr', 'card'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                        paymentMethod === m ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {m === 'cash' ? '💵 Cash' : m === 'qr' ? '📱 QR' : '💳 Card'}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Amount Tendered (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={cartTotal}
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    placeholder={cartTotal.toFixed(2)}
                    className="w-full border rounded-xl px-3 py-2.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-400"
                    autoFocus
                  />
                  {change !== null && change >= 0 && (
                    <div className="mt-2 bg-green-50 rounded-xl px-4 py-2.5 flex justify-between">
                      <span className="text-gray-600 text-sm">Change</span>
                      <span className="font-bold text-green-600 text-lg">₱{change.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'qr' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">QR Reference #</label>
                  <input
                    value={qrReference}
                    onChange={(e) => setQrReference(e.target.value)}
                    placeholder="GCash / Maya reference"
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              )}

              <button
                onClick={handleProcessPayment}
                disabled={submitting || (paymentMethod === 'cash' && (!amountTendered || parseFloat(amountTendered) < cartTotal))}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {submitting ? 'Processing…' : '✓ Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt modal */}
      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
