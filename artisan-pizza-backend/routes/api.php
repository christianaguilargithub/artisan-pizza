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
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
});

// ─── Protected Routes ──────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',      [AuthController::class, 'me']);

    // Roles
    Route::apiResource('roles', RoleController::class);

    // Users
    Route::apiResource('users', UserController::class);

    // Categories
    Route::apiResource('categories', CategoryController::class);

    // Products
    Route::apiResource('products', ProductController::class);
    Route::post('products/{product}/inventory',                      [ProductController::class, 'attachInventory']);
    Route::delete('products/{product}/inventory/{inventoryItemId}',  [ProductController::class, 'detachInventory']);

    // Inventory Items
    Route::apiResource('inventory-items', InventoryItemController::class);

    // Orders
    Route::get('orders/queue',              [OrderController::class, 'queue']);
    Route::apiResource('orders', OrderController::class)->except(['update']);
    Route::patch('orders/{order}/status',   [OrderController::class, 'updateStatus']);
    Route::post('orders/{order}/refund',    [OrderController::class, 'refund']);

    // Payments
    Route::apiResource('payments', PaymentController::class);
    Route::get('payments/{payment}/receipt', [PaymentController::class, 'receipt']);

    // Shifts
    Route::get('shifts',                    [ShiftController::class, 'index']);
    Route::get('shifts/current',            [ShiftController::class, 'current']);
    Route::post('shifts/open',              [ShiftController::class, 'open']);
    Route::post('shifts/{shift}/close',     [ShiftController::class, 'close']);
    Route::get('shifts/{shift}',            [ShiftController::class, 'show']);

    // Discounts
    Route::apiResource('discounts', DiscountController::class);
    Route::post('discounts/validate',       [DiscountController::class, 'validate']);

    // Reports
    Route::get('reports/daily',             [ReportController::class, 'daily']);
});
