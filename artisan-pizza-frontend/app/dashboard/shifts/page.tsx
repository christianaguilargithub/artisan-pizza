'use client';

import { useCallback, useEffect, useState } from 'react';
import { shiftService } from '@/lib/services/shiftService';
import Pagination from '@/components/ui/Pagination';
import type { PaginatedResponse, Shift } from '@/types';

export default function ShiftsPage() {
  const [current, setCurrent] = useState<Shift | null>(null);
  const [data, setData] = useState<PaginatedResponse<Shift> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Open shift form
  const [openingCash, setOpeningCash] = useState('');
  const [openNotes, setOpenNotes] = useState('');

  // Close shift form
  const [closingCash, setClosingCash] = useState('');
  const [closeNotes, setCloseNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [cur, shifts] = await Promise.all([
      shiftService.getCurrent().catch(() => null),
      shiftService.getAll(page),
    ]);
    setCurrent(cur);
    setData(shifts);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await shiftService.open({ opening_cash: parseFloat(openingCash), notes: openNotes || undefined });
      setOpeningCash('');
      setOpenNotes('');
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    setSubmitting(true);
    try {
      await shiftService.close(current.id, { closing_cash: parseFloat(closingCash), notes: closeNotes || undefined });
      setClosingCash('');
      setCloseNotes('');
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const variance = current && closingCash && current.expected_cash != null
    ? parseFloat(closingCash) - Number(current.expected_cash)
    : null;

  const fmt = (raw: string) => new Date(raw.replace(' ', 'T')).toLocaleString();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
        <p className="text-sm text-gray-500 mt-1">Open and close your cashier shift, track cash reconciliation</p>
      </div>

      {/* Current shift card */}
      <div className={`rounded-2xl border p-6 mb-8 ${current ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
        {current ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🟢</span>
                <div>
                  <p className="font-bold text-green-800">Shift Open</p>
                  <p className="text-xs text-gray-500">Since {fmt(current.opened_at)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Opening Cash</p>
                <p className="font-bold text-lg text-green-700">₱{Number(current.opening_cash).toFixed(2)}</p>
              </div>
            </div>

            {/* Close shift form */}
            <form onSubmit={handleClose} className="space-y-3 border-t border-green-200 pt-4">
              <p className="text-sm font-semibold text-gray-700">Close Shift</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Closing Cash Count (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={closingCash}
                    onChange={(e) => setClosingCash(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Notes (optional)</label>
                  <input
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                    placeholder="Any remarks…"
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
              {variance !== null && (
                <div className={`rounded-xl px-4 py-2.5 flex justify-between text-sm ${variance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <span className="text-gray-600">Cash Variance</span>
                  <span className={`font-bold ${variance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {variance >= 0 ? '+' : ''}₱{variance.toFixed(2)}
                  </span>
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Closing…' : 'Close Shift'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🔴</span>
              <div>
                <p className="font-bold text-gray-700">No Active Shift</p>
                <p className="text-xs text-gray-500">Open a shift to start processing orders</p>
              </div>
            </div>

            <form onSubmit={handleOpen} className="space-y-3 border-t border-gray-200 pt-4">
              <p className="text-sm font-semibold text-gray-700">Open New Shift</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Opening Cash (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={openingCash}
                    onChange={(e) => setOpeningCash(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Notes (optional)</label>
                  <input
                    value={openNotes}
                    onChange={(e) => setOpenNotes(e.target.value)}
                    placeholder="Any remarks…"
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Opening…' : 'Open Shift'}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Shift history */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">Shift History</h2>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Cashier</th>
                  <th className="px-4 py-3 text-left">Opened</th>
                  <th className="px-4 py-3 text-left">Closed</th>
                  <th className="px-4 py-3 text-left">Opening</th>
                  <th className="px-4 py-3 text-left">Closing</th>
                  <th className="px-4 py-3 text-left">Sales</th>
                  <th className="px-4 py-3 text-left">Orders</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.data.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">No shifts yet.</td></tr>
                )}
                {data?.data.map((shift) => {
                  const variance = shift.closing_cash != null && shift.expected_cash != null
                    ? Number(shift.closing_cash) - Number(shift.expected_cash)
                    : null;
                  return (
                    <tr key={shift.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{shift.user?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmt(shift.opened_at)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{shift.closed_at ? fmt(shift.closed_at) : '—'}</td>
                      <td className="px-4 py-3">₱{Number(shift.opening_cash).toFixed(2)}</td>
                      <td className="px-4 py-3">{shift.closing_cash != null ? `₱${Number(shift.closing_cash).toFixed(2)}` : '—'}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">₱{Number(shift.total_sales).toFixed(2)}</td>
                      <td className="px-4 py-3">{shift.total_orders}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${shift.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {shift.status}
                          </span>
                          {variance !== null && (
                            <span className={`text-xs font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {variance >= 0 ? '+' : ''}₱{variance.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={data!.current_page} lastPage={data!.last_page} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
