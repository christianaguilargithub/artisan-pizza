'use client';

import type { ReceiptData } from '@/types';

interface Props {
  receipt: ReceiptData;
  onClose: () => void;
}

export default function ReceiptModal({ receipt, onClose }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm print:hidden" onClick={onClose} />

      <div className="relative z-10 bg-white w-full max-w-sm mx-4 rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-full print:mx-0">
        {/* Actions — hidden on print */}
        <div className="flex items-center justify-between px-5 py-3 border-b print:hidden">
          <h2 className="font-semibold text-gray-800">Receipt</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-700"
            >
              🖨️ Print
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
        </div>

        {/* Receipt body */}
        <div id="receipt-content" className="px-6 py-5 font-mono text-sm">
          {/* Header */}
          <div className="text-center mb-4">
            <p className="text-xl font-bold">🍕 Artisan Pizza</p>
            <p className="text-xs text-gray-500">Official Receipt</p>
            <p className="text-xs text-gray-400 mt-1">{receipt.date}</p>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Meta */}
          <div className="space-y-1 text-xs mb-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Receipt #</span>
              <span className="font-semibold">{receipt.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Queue #</span>
              <span className="font-semibold">#{receipt.queue_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="capitalize">{receipt.order_source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cashier</span>
              <span>{receipt.cashier}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Items */}
          <div className="space-y-1.5 mb-3">
            {receipt.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <div>
                  <span>{item.name}</span>
                  <span className="text-gray-400 ml-1">x{item.quantity}</span>
                </div>
                <span>₱{item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>₱{receipt.subtotal.toFixed(2)}</span>
            </div>
            {receipt.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount {receipt.discount_code ? `(${receipt.discount_code})` : ''}</span>
                <span>-₱{receipt.discount_amount.toFixed(2)}</span>
              </div>
            )}
            {receipt.tax_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span>₱{receipt.tax_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200">
              <span>TOTAL</span>
              <span>₱{receipt.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Payment */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className="capitalize">{receipt.payment_method === 'qr' ? 'QR Code' : receipt.payment_method}</span>
            </div>
            {receipt.payment_method === 'cash' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tendered</span>
                  <span>₱{receipt.amount_tendered.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-500">Change</span>
                  <span>₱{receipt.change_given.toFixed(2)}</span>
                </div>
              </>
            )}
            {receipt.qr_reference && (
              <div className="flex justify-between">
                <span className="text-gray-500">Ref #</span>
                <span className="text-xs">{receipt.qr_reference}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          <p className="text-center text-xs text-gray-400">Thank you for dining with us! 🍕</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #receipt-content { display: block !important; }
          .fixed { position: static !important; }
          .absolute { display: none !important; }
        }
      `}</style>
    </div>
  );
}
