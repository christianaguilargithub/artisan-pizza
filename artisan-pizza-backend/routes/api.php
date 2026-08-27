<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Api\InventoryItemController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ─── Public Auth Routes ────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login'])->middleware('throttle:10,1');
});

// ─── Protected Routes ──────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth (any authenticated user)
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',      [AuthController::class, 'me']);

    // Kitchen queue — all authenticated roles
    Route::get('orders/queue', [OrderController::class, 'queue']);

    // ── Admin only ────────────────────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('roles', RoleController::class);
        Route::apiResource('users', UserController::class);

        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
        Route::post('products/{product}/inventory',                     [ProductController::class, 'attachInventory']);
        Route::delete('products/{product}/inventory/{inventoryItemId}', [ProductController::class, 'detachInventory']);

        Route::apiResource('inventory-items', InventoryItemController::class)->except(['index', 'show']);

        Route::apiResource('discounts', DiscountController::class)->except(['index', 'show']);

        Route::get('reports/daily', [ReportController::class, 'daily']);

        Route::delete('orders/{order}', [OrderController::class, 'destroy']);

        // Payment void — admin only, never hard-deletes
        Route::post('payments/{payment}/void', [PaymentController::class, 'void']);
    });

    // ── Admin + Cashier ───────────────────────────────────────────────────────
    Route::middleware('role:admin,cashier')->group(function () {
        // Orders (create + read + status + refund)
        Route::get('orders',                      [OrderController::class, 'index']);
        Route::post('orders',                     [OrderController::class, 'store']);
        Route::get('orders/{order}',              [OrderController::class, 'show']);
        Route::patch('orders/{order}/status',     [OrderController::class, 'updateStatus']);
        Route::post('orders/{order}/refund',      [OrderController::class, 'refund']);

        // Payments
        Route::get('payments/{payment}/receipt',  [PaymentController::class, 'receipt']);
        Route::get('payments',                    [PaymentController::class, 'index']);
        Route::post('payments',                   [PaymentController::class, 'store']);
        Route::get('payments/{payment}',          [PaymentController::class, 'show']);
        Route::put('payments/{payment}',          [PaymentController::class, 'update']);
        // void is admin-only — declared inside the admin group below

        // Shifts
        Route::get('shifts',                      [ShiftController::class, 'index']);
        Route::get('shifts/current',              [ShiftController::class, 'current']);
        Route::post('shifts/open',                [ShiftController::class, 'open']);
        Route::post('shifts/{shift}/close',       [ShiftController::class, 'close']);
        Route::get('shifts/{shift}',              [ShiftController::class, 'show']);

        // Discounts — read + validate available to cashier for POS
        Route::get('discounts',                   [DiscountController::class, 'index']);
        Route::get('discounts/{discount}',        [DiscountController::class, 'show']);
        Route::post('discounts/validate',         [DiscountController::class, 'validate']);
    });

    // ── Read-only product/category/inventory — all authenticated roles ─────────
    Route::get('categories',              [CategoryController::class, 'index']);
    Route::get('categories/{category}',   [CategoryController::class, 'show']);
    Route::get('products',                [ProductController::class, 'index']);
    Route::get('products/{product}',      [ProductController::class, 'show']);
    Route::get('inventory-items',         [InventoryItemController::class, 'index']);
    Route::get('inventory-items/{inventoryItem}', [InventoryItemController::class, 'show']);
});

}); // end v1
