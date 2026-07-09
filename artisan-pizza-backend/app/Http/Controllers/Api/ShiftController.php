<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Shift::with('user')->orderByDesc('opened_at')->paginate(15)
        );
    }

    public function current(Request $request): JsonResponse
    {
        $shift = Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        return response()->json($shift);
    }

    public function open(Request $request): JsonResponse
    {
        $existing = Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You already have an open shift.'], 422);
        }

        $data = $request->validate([
            'opening_cash' => 'required|numeric|min:0',
            'notes'        => 'nullable|string',
        ]);

        $shift = Shift::create([
            'user_id'      => $request->user()->id,
            'opening_cash' => $data['opening_cash'],
            'notes'        => $data['notes'] ?? null,
            'status'       => 'open',
            'opened_at'    => now(),
        ]);

        return response()->json($shift->load('user'), 201);
    }

    public function close(Request $request, Shift $shift): JsonResponse
    {
        if ($shift->status === 'closed') {
            return response()->json(['message' => 'Shift already closed.'], 422);
        }

        $data = $request->validate([
            'closing_cash' => 'required|numeric|min:0',
            'notes'        => 'nullable|string',
        ]);

        // Compute totals from orders in this shift
        $orders = $shift->orders()->whereIn('status', ['completed'])->get();
        $totalSales  = $orders->sum('total_amount');
        $totalOrders = $orders->count();

        // Expected cash = opening + cash sales
        $cashSales = $shift->orders()
            ->whereHas('payment', fn($q) => $q->where('payment_method', 'cash')->where('status', 'paid'))
            ->with('payment')
            ->get()
            ->sum(fn($o) => $o->payment?->amount_tendered - $o->payment?->change_given ?? 0);

        $expectedCash = $shift->opening_cash + $cashSales;

        $shift->update([
            'closing_cash'  => $data['closing_cash'],
            'expected_cash' => $expectedCash,
            'total_sales'   => $totalSales,
            'total_orders'  => $totalOrders,
            'status'        => 'closed',
            'closed_at'     => now(),
            'notes'         => $data['notes'] ?? $shift->notes,
        ]);

        return response()->json($shift->load('user'));
    }

    public function show(Shift $shift): JsonResponse
    {
        return response()->json($shift->load('user', 'orders.payment'));
    }
}
