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

        return response()->json($payment->load('order'), 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        return response()->json($payment->load('order.orderItems.product'));
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
