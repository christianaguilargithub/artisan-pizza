# Artisan Pizza POS — Improvement Plan

Based on a full code review comparing the system against industry-standard POS systems (Square, Toast, Lightspeed).

---

## 🔴 Critical

### 1. Hardcoded Credentials in `User.php` (lines 29–30)
Default password values are hardcoded in the model. These must be removed and handled exclusively through seeders with environment-driven values.

**File**: `artisan-pizza-backend/app/Models/User.php`

---

## 🟠 High

### 2. No Role-Based Authorization Middleware on API Routes
Any authenticated user can call any endpoint regardless of role. A cashier can access reports, delete users, or close another user's shift.

**Fix**: Create `role` middleware and apply it per route group in `routes/api.php`.

```php
// Example
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('discounts', DiscountController::class);
    Route::get('reports/daily', [ReportController::class, 'daily']);
});
```

### 3. SQL Injection Flags (Likely False Positives — Verify)
Scanner flagged Eloquent `->where()` calls in multiple controllers. Eloquent uses PDO parameterized queries so these are likely false positives, but each should be manually confirmed that no raw user input is interpolated into query strings.

| File | Lines |
|------|-------|
| `OrderController.php` | 43–44, 50–51, 154–155 |
| `AuthController.php` | 44–45 |
| `DiscountController.php` | 67–68 |
| `ShiftController.php` | 25, 33 |

### 4. Tax Rate is Client-Controlled
`tax_rate` is sent from the frontend and trusted by the server. This allows any client to submit orders with 0% tax.

**Fix**: Move tax rate to a server-side config value.

```php
// config/pos.php
'tax_rate' => env('TAX_RATE', 12),

// OrderController
$taxRate = config('pos.tax_rate');
```

### 5. No Stock Availability Check Before Order Creation
Inventory is deducted after order creation but never checked beforehand. An order can be placed even if stock is at 0.

**Fix**: In `OrderController::store()`, validate stock levels before persisting the order.

---

## 🟡 Medium

### 6. No FormRequest Classes — Validation Inline in Controllers
All validation is done inline with `$request->validate()` inside controller methods, making controllers fat and untestable in isolation.

**Fix**: Extract to FormRequest classes (e.g., `StoreOrderRequest`, `ProcessPaymentRequest`).

### 7. No API Resource / Transformer Classes
Raw Eloquent models are returned directly. This exposes internal column names, makes response shape changes risky, and leaks fields like `password` if `$hidden` is ever misconfigured.

**Fix**: Create Laravel API Resource classes (e.g., `OrderResource`, `UserResource`).

### 8. No Rate Limiting on Login Endpoint
`POST /api/auth/login` has no rate limiting, making it vulnerable to brute-force attacks.

**Fix**: Apply Laravel's built-in throttle middleware.

```php
Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
```

### 9. No Soft Deletes on Any Model
Hard deletes on orders, products, and payments permanently destroy historical data. Deleting a product breaks order history references.

**Fix**: Add `SoftDeletes` trait to `Order`, `Product`, `Payment`, `OrderItem`.

### 10. No Void/Cancel Protection on Payments
Payments can be hard-deleted via `DELETE /api/payments/{id}`. A paid order's payment record can be erased with no audit trail.

**Fix**: Remove the delete route for payments entirely, or restrict to admin with a `voided` status instead of deletion.

### 11. Frontend Token Stored in JS-Accessible Cookie
The Sanctum token is stored via `js-cookie` (not `httpOnly`), making it readable by any JavaScript on the page and vulnerable to XSS theft.

**Fix**: Store the token in an `httpOnly` cookie set by the server, or proxy auth through a Next.js API route that sets the cookie server-side.

---

## 🔵 Low

### 12. Hardcoded Default Password in `UserController` (line 44)
A default password string is hardcoded when creating users.

**File**: `artisan-pizza-backend/app/Http/Controllers/Api/UserController.php`

**Fix**: Require password on user creation or generate a random one and return it once.

### 13. No Pagination on Categories and Discounts
`GET /api/categories` and `GET /api/discounts` return all records. These will degrade as data grows.

**Fix**: Add `->paginate()` consistent with orders and payments endpoints.

### 14. No Order Item Editing After Creation
Once an order is placed, individual items cannot be modified. Cashiers must cancel and recreate the entire order for any change.

**Fix**: Add `PUT /api/orders/{id}/items/{itemId}` and `DELETE /api/orders/{id}/items/{itemId}` endpoints with inventory reconciliation.

---

## 💡 Missing POS Features (Future Scope)

| Feature | Priority | Notes |
|---|---|---|
| Stock check before order | High | Block order if any item has insufficient inventory |
| Z-Report / End-of-day report | High | Shift summary with cash reconciliation printed at close |
| Product modifiers / add-ons | Medium | e.g., extra cheese, crust type |
| Hold orders | Medium | Park an order and resume later |
| Split billing | Medium | Divide one order across multiple payments |
| Partial payments | Medium | Accept multiple payment methods on one order |
| Customer management | Medium | Track order history per customer |
| Table management | Low | Assign orders to dine-in table numbers |
| Barcode / SKU lookup | Low | Scan product barcodes at POS |
| Multi-branch support | Low | Separate inventory and reporting per location |
| Printer / hardware integration | Low | ESC/POS receipt printer support |

---

## ✅ What's Already Done Well

- Sanctum token-based auth correctly decoupled from frontend
- Inventory auto-deduction on order creation via `product_inventory` pivot
- Queue number resets daily
- `called_at` auto-set on status → `ready`
- Refund restores inventory and decrements discount usage count
- `unit_price` snapshot on `order_items` preserves historical pricing
- Route ordering fixed (`/validate`, `/current`, `/queue` before parameterized routes)
- Shift close null-safe operator precedence bug fixed
- CORS restricted to `FRONTEND_URL` only




