<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Order::with('user', 'orderItems.product', 'payment')
                ->orderByDesc('created_at')
                ->paginate(15)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_source'       => 'required|in:dine-in,online,walk-in',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        $order = DB::transaction(function () use ($request, $data) {
            $lastQueue = Order::whereDate('created_at', today())->max('queue_number') ?? 0;

            $order = Order::create([
                'user_id'      => $request->user()->id,
                'queue_number' => $lastQueue + 1,
                'order_source' => $data['order_source'],
                'status'       => 'pending',
                'total_amount' => 0,
            ]);

            $total = 0;

            foreach ($data['items'] as $item) {
                $product   = Product::findOrFail($item['product_id']);
                $unitPrice = $product->price;
                $total    += $unitPrice * $item['quantity'];

                $order->orderItems()->create([
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                    'unit_price' => $unitPrice,
                ]);
            }

            $order->update(['total_amount' => $total]);

            return $order;
        });

        return response()->json($order->load('orderItems.product', 'user'), 201);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load('user', 'orderItems.product', 'payment'));
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,preparing,ready,completed,cancelled',
        ]);

        if ($data['status'] === 'ready') {
            $order->update(['status' => $data['status'], 'called_at' => now()]);
        } else {
            $order->update(['status' => $data['status']]);
        }

        return response()->json($order->fresh('orderItems.product', 'payment'));
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();

        return response()->json(['message' => 'Order deleted.']);
    }

    public function queue(): JsonResponse
    {
        $orders = Order::with('orderItems.product')
            ->whereIn('status', ['pending', 'preparing', 'ready'])
            ->orderBy('queue_number')
            ->get();

        return response()->json($orders);
    }
}
