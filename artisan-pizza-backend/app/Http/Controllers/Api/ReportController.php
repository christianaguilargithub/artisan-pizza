<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function daily(Request $request): JsonResponse
    {
        $date = $request->query('date', today()->toDateString());

        $orders = Order::whereDate('created_at', $date)
            ->with('orderItems.product', 'payment')
            ->get();

        $completed = $orders->where('status', 'completed');

        $totalSales    = $completed->sum('total_amount');
        $totalOrders   = $completed->count();
        $avgOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

        // Sales by payment method
        $byMethod = Payment::whereDate('created_at', $date)
            ->where('status', 'paid')
            ->get()
            ->groupBy('payment_method')
            ->map(fn($g) => [
                'count'  => $g->count(),
                'amount' => $g->sum('amount_tendered') - $g->sum('change_given'),
            ]);

        // Top products
        $productSales = [];
        foreach ($completed as $order) {
            foreach ($order->orderItems as $item) {
                $id = $item->product_id;
                if (!isset($productSales[$id])) {
                    $productSales[$id] = [
                        'product_id'   => $id,
                        'product_name' => $item->product?->name ?? "Product #{$id}",
                        'quantity'     => 0,
                        'revenue'      => 0,
                    ];
                }
                $productSales[$id]['quantity'] += $item->quantity;
                $productSales[$id]['revenue']  += $item->unit_price * $item->quantity;
            }
        }
        usort($productSales, fn($a, $b) => $b['quantity'] - $a['quantity']);
        $topProducts = array_slice(array_values($productSales), 0, 5);

        // Order status breakdown
        $statusBreakdown = $orders->groupBy('status')->map->count();

        // Low stock items
        $lowStock = InventoryItem::where('low_stock_threshold', '>', 0)
            ->whereColumn('quantity', '<=', 'low_stock_threshold')
            ->get(['id', 'name', 'unit', 'quantity', 'low_stock_threshold']);

        return response()->json([
            'date'             => $date,
            'total_sales'      => round($totalSales, 2),
            'total_orders'     => $totalOrders,
            'avg_order_value'  => round($avgOrderValue, 2),
            'by_payment_method'=> $byMethod,
            'top_products'     => $topProducts,
            'status_breakdown' => $statusBreakdown,
            'low_stock_items'  => $lowStock,
        ]);
    }
}
