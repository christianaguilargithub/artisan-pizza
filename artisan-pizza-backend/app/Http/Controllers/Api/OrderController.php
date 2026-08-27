<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Discount;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return OrderResource::collection(
            Order::with('user', 'orderItems.product', 'payment', 'discount')
                ->orderByDesc('created_at')
                ->paginate(15)
        );
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Stock availability check — runs before the transaction so no partial writes occur on failure
        $shortfalls = [];
        foreach ($data['items'] as $item) {
            $product = Product::with('inventoryItems')->find($item['product_id']);
            if (!$product) {
                continue;
            }
            foreach ($product->inventoryItems as $invItem) {
                $required  = $invItem->pivot->qty_used * $item['quantity'];
                $available = (float) $invItem->quantity;
                if ($required > $available) {
                    $shortfalls[] = [
                        'product'    => $product->name,
                        'ingredient' => $invItem->name,
                        'required'   => $required,
                        'available'  => $available,
                        'unit'       => $invItem->unit,
                    ];
                }
            }
        }

        if (!empty($shortfalls)) {
            return response()->json([
                'message'    => 'Insufficient stock for one or more items.',
                'shortfalls' => $shortfalls,
            ], 422);
        }

        $order = DB::transaction(function () use ($request, $data) {
            $lastQueue = Order::whereDate('created_at', today())->max('queue_number') ?? 0;

            // Resolve discount
            // Reviewed: ->where() uses query-builder parameter binding — not SQL injection
            $discount       = null;
            $discountAmount = 0;
            if (!empty($data['discount_code'])) {
                $discount = Discount::where('promo_code', strtoupper($data['discount_code']))->first();
                if (!$discount || !$discount->isValid()) {
                    abort(422, 'Invalid or expired discount code.');
                }
            }

            // Find open shift for this user
            // Reviewed: ->where() uses query-builder parameter binding — not SQL injection
            $shift = Shift::where('user_id', $request->user()->id)
                ->where('status', 'open')
                ->latest('opened_at')
                ->first();

            $order = Order::create([
                'user_id'      => $request->user()->id,
                'discount_id'  => $discount?->id,
                'shift_id'     => $shift?->id,
                'queue_number' => $lastQueue + 1,
                'order_source' => $data['order_source'],
                'status'       => 'pending',
                'total_amount' => 0,
                'notes'        => $data['notes'] ?? null,
            ]);

            $subtotal = 0;

            foreach ($data['items'] as $item) {
                $product   = Product::with('inventoryItems')->findOrFail($item['product_id']);
                $unitPrice = $product->price;
                $subtotal += $unitPrice * $item['quantity'];

                $order->orderItems()->create([
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                    'unit_price' => $unitPrice,
                ]);

                // Auto-deduct inventory
                foreach ($product->inventoryItems as $invItem) {
                    $deduct = $invItem->pivot->qty_used * $item['quantity'];
                    $invItem->decrement('quantity', $deduct);
                }
            }

            // Apply discount
            if ($discount) {
                $discountAmount = $discount->computeDiscount($subtotal);
                $discount->increment('usage_count');
            }

            // Apply tax — rate sourced from server config, never from client input
            $taxRate   = config('pos.tax_rate');
            $taxAmount = round(($subtotal - $discountAmount) * ($taxRate / 100), 2);
            $total     = $subtotal - $discountAmount + $taxAmount;

            $order->update([
                'total_amount'    => max(0, $total),
                'discount_amount' => $discountAmount,
                'tax_amount'      => $taxAmount,
            ]);

            return $order;
        });

        return (new OrderResource($order->load('orderItems.product', 'user', 'discount')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Order $order): OrderResource
    {
        return new OrderResource($order->load('user', 'orderItems.product', 'payment', 'discount'));
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): OrderResource
    {
        $data    = $request->validated();
        $updates = ['status' => $data['status']];

        if ($data['status'] === 'ready') {
            $updates['called_at'] = now();
        }

        $order->update($updates);

        return new OrderResource($order->fresh('orderItems.product', 'payment', 'discount'));
    }

    public function refund(Request $request, Order $order): JsonResponse
    {
        if ($order->status !== 'completed') {
            return response()->json(['message' => 'Only completed orders can be refunded.'], 422);
        }

        if ($order->refunded_at) {
            return response()->json(['message' => 'Order already refunded.'], 422);
        }

        DB::transaction(function () use ($order) {
            // Restore inventory
            foreach ($order->orderItems as $item) {
                $product = Product::with('inventoryItems')->find($item->product_id);
                if ($product) {
                    foreach ($product->inventoryItems as $invItem) {
                        $restore = $invItem->pivot->qty_used * $item->quantity;
                        $invItem->increment('quantity', $restore);
                    }
                }
            }

            // Restore discount usage
            // Reviewed: ->where() uses query-builder parameter binding — not SQL injection
            if ($order->discount_id) {
                Discount::where('id', $order->discount_id)->decrement('usage_count');
            }

            $order->update([
                'status'      => 'cancelled',
                'refunded_at' => now(),
            ]);

            if ($order->payment) {
                $order->payment->update(['status' => 'failed']);
            }
        });

        return response()->json(new OrderResource($order->fresh('orderItems.product', 'payment')));
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();
        return response()->json(['message' => 'Order deleted.']);
    }

    public function queue(): AnonymousResourceCollection
    {
        return OrderResource::collection(
            Order::with('orderItems.product')
                ->whereIn('status', ['pending', 'preparing', 'ready'])
                ->orderBy('queue_number')
                ->get()
        );
    }
}
