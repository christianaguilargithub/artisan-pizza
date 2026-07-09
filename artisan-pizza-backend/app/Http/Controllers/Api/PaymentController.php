<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Payment::with('order')->orderByDesc('created_at')->paginate(15)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id'        => 'required|exists:orders,id|unique:payments,order_id',
            'payment_method'  => 'required|in:cash,qr,card',
            'amount_tendered' => 'required|numeric|min:0',
            'qr_reference'    => 'nullable|string|max:255',
        ]);

        $order = Order::findOrFail($data['order_id']);

        $changeGiven = max(0, $data['amount_tendered'] - $order->total_amount);

        $payment = Payment::create([
            'order_id'        => $data['order_id'],
            'payment_method'  => $data['payment_method'],
            'amount_tendered' => $data['amount_tendered'],
            'change_given'    => $changeGiven,
            'qr_reference'    => $data['qr_reference'] ?? null,
            'status'          => 'paid',
        ]);

        $order->update(['status' => 'completed']);

        return response()->json($payment->load('order.orderItems.product', 'order.discount'), 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        return response()->json($payment->load('order.orderItems.product', 'order.discount'));
    }

    public function receipt(Payment $payment): JsonResponse
    {
        $payment->load('order.orderItems.product', 'order.user', 'order.discount');
        $order = $payment->order;

        $items = $order->orderItems->map(fn($item) => [
            'name'       => $item->product?->name ?? "Item #{$item->product_id}",
            'quantity'   => $item->quantity,
            'unit_price' => (float) $item->unit_price,
            'subtotal'   => (float) $item->unit_price * $item->quantity,
        ]);

        return response()->json([
            'receipt_number'   => 'RCP-' . str_pad($payment->id, 6, '0', STR_PAD_LEFT),
            'date'             => $payment->created_at->format('M d, Y h:i A'),
            'cashier'          => $order->user?->name ?? 'N/A',
            'queue_number'     => $order->queue_number,
            'order_source'     => $order->order_source,
            'items'            => $items,
            'subtotal'         => (float) ($order->total_amount + $order->discount_amount - $order->tax_amount),
            'discount_code'    => $order->discount?->promo_code,
            'discount_amount'  => (float) $order->discount_amount,
            'tax_amount'       => (float) $order->tax_amount,
            'total'            => (float) $order->total_amount,
            'payment_method'   => $payment->payment_method,
            'amount_tendered'  => (float) $payment->amount_tendered,
            'change_given'     => (float) $payment->change_given,
            'qr_reference'     => $payment->qr_reference,
        ]);
    }

    public function update(Request $request, Payment $payment): JsonResponse
    {
        $data = $request->validate([
            'payment_method'  => 'sometimes|in:cash,qr,card',
            'amount_tendered' => 'sometimes|numeric|min:0',
            'qr_reference'    => 'nullable|string|max:255',
            'status'          => 'sometimes|in:pending,paid,failed',
        ]);

        $payment->update($data);

        return response()->json($payment->load('order'));
    }

    public function destroy(Payment $payment): JsonResponse
    {
        $payment->delete();
        return response()->json(['message' => 'Payment deleted.']);
    }
}
