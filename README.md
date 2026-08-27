# 🍕 Artisan Pizza POS System

A full-stack Point of Sale (POS) system built for Artisan Pizza — powered by a **Laravel 12 REST API** backend and a **Next.js 15 + TypeScript** frontend. Designed for real-world restaurant operations including order management, kitchen queue display, inventory tracking, payment processing, shift management, discount/promo codes, and daily reporting.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Entity Relationship Diagram](#-entity-relationship-diagram)
- [Database Schema](#-database-schema)
- [Backend Architecture](#-backend-architecture)
  - [Models & Relationships](#models--relationships)
  - [API Controllers](#api-controllers)
  - [API Endpoints](#api-endpoints)
- [Frontend Architecture](#-frontend-architecture)
  - [Pages](#pages)
  - [Components](#components)
  - [Services](#services)
  - [Context](#context)
- [Authentication](#-authentication)
- [Role-Based Access](#-role-based-access)
- [Getting Started](#-getting-started)
- [Default Credentials](#-default-credentials)
- [Environment Variables](#-environment-variables)
- [Migration Order](#-migration-order)
- [Developer Notes](#-developer-notes)

---

## 🛠 Tech Stack

| Layer       | Technology                    |
|-------------|-------------------------------|
| Backend     | Laravel 12, PHP 8.2           |
| Auth        | Laravel Sanctum (Token-based) |
| Database    | PostgreSQL                    |
| ORM         | Eloquent                      |
| Frontend    | Next.js 15 (App Router)       |
| Language    | TypeScript                    |
| Styling     | Tailwind CSS v4               |
| HTTP Client | Axios                         |
| State       | React Context API             |

---

## 📁 Project Structure

```
artisan-pizza/
├── artisan-pizza-backend/          # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── RoleController.php
│   │   │   ├── UserController.php
│   │   │   ├── CategoryController.php
│   │   │   ├── ProductController.php
│   │   │   ├── InventoryItemController.php
│   │   │   ├── OrderController.php
│   │   │   ├── PaymentController.php
│   │   │   ├── ShiftController.php
│   │   │   ├── DiscountController.php
│   │   │   └── ReportController.php
│   │   └── Models/
│   │       ├── Role.php
│   │       ├── User.php
│   │       ├── Category.php
│   │       ├── Product.php
│   │       ├── InventoryItem.php
│   │       ├── ProductInventory.php
│   │       ├── Order.php
│   │       ├── OrderItem.php
│   │       ├── Payment.php
│   │       ├── Shift.php
│   │       └── Discount.php
│   ├── database/migrations/
│   ├── database/seeders/
│   ├── routes/api.php
│   └── config/
│       ├── cors.php
│       └── sanctum.php
│
└── artisan-pizza-frontend/         # Next.js App
    ├── app/
    │   ├── login/page.tsx
    │   └── dashboard/
    │       ├── page.tsx
    │       ├── layout.tsx
    │       ├── orders/
    │       │   ├── page.tsx
    │       │   ├── admin-order-page.tsx
    │       │   └── cashier-order-page.tsx
    │       ├── queue/page.tsx
    │       ├── products/page.tsx
    │       ├── categories/page.tsx
    │       ├── inventory/page.tsx
    │       ├── payments/page.tsx
    │       ├── shifts/page.tsx
    │       ├── discounts/page.tsx
    │       └── reports/page.tsx
    ├── components/
    │   ├── layout/Sidebar.tsx
    │   └── ui/
    │       ├── Modal.tsx
    │       ├── StatusBadge.tsx
    │       ├── Pagination.tsx
    │       └── ReceiptModal.tsx
    ├── context/AuthContext.tsx
    ├── lib/
    │   ├── api.ts
    │   └── services/
    │       ├── authService.ts
    │       ├── roleService.ts
    │       ├── categoryService.ts
    │       ├── productService.ts
    │       ├── inventoryService.ts
    │       ├── orderService.ts
    │       ├── paymentService.ts
    │       ├── shiftService.ts
    │       ├── discountService.ts
    │       └── reportService.ts
    └── types/index.ts
```

---

## 🗺 Entity Relationship Diagram

```
┌──────────┐     ┌─────────────────┐     ┌──────────────────────────────────┐
│  ROLES   │     │      USERS      │     │             ORDERS               │
├──────────┤     ├─────────────────┤     ├──────────────────────────────────┤
│ PK id    │─1:∞─│ PK id           │─1:∞─│ PK  id                           │
│    name  │     │ FK role_id      │     │ FK  user_id                      │
└──────────┘     │    name         │     │ FK  discount_id (nullable)       │
                 │    email        │     │ FK  shift_id (nullable)          │
                 │    password     │     │     queue_number (int)           │
                 └─────────────────┘     │     order_source                 │
                                         │     status                       │
                 ┌─────────────────┐     │     total_amount (decimal)       │
                 │    SHIFTS       │─1:∞─│     discount_amount (decimal)    │
                 ├─────────────────┤     │     tax_amount (decimal)         │
                 │ PK id           │     │     notes (text)                 │
                 │ FK user_id      │     │     called_at (timestamp)        │
                 │    opening_cash │     │     refunded_at (timestamp)      │
                 │    closing_cash │     └────────────────┬─────────────────┘
                 │    expected_cash│                      │ 1:∞
                 │    total_sales  │     ┌────────────────┴─────────────────┐
                 │    total_orders │     │           ORDER_ITEMS            │
                 │    status       │     ├──────────────────────────────────┤
                 │    opened_at    │     │ PK  id                           │
                 │    closed_at    │     │ FK  order_id                     │
                 └─────────────────┘     │ FK  product_id                   │
                                         │     quantity (int)               │
                 ┌─────────────────┐     │     unit_price (decimal)         │
                 │   DISCOUNTS     │     └────────────────┬─────────────────┘
                 ├─────────────────┤                      │ ∞:1
                 │ PK id           │     ┌────────────────┴─────────────────┐
                 │    name         │     │            PRODUCTS              │
                 │    promo_code   │     ├──────────────────────────────────┤
                 │    type         │     │ PK  id                           │
                 │    value        │     │ FK  category_id                  │
                 │    usage_limit  │     │     name                         │
                 │    usage_count  │     │     price (decimal)              │
                 │    is_active    │     │     image_path (nullable)        │
                 │    expires_at   │     │     author (int)                 │
                 │ FK created_by   │     └────────────────┬─────────────────┘
                 └─────────────────┘                      │ ∞ (via pivot)
                                         ┌────────────────┴─────────────────┐
┌──────────────────┐                     │       PRODUCT_INVENTORY          │
│    PAYMENTS      │                     ├──────────────────────────────────┤
├──────────────────┤                     │ PK  id                           │
│ PK id            │                     │ FK  product_id                   │
│ FK order_id      │                     │ FK  inventory_item_id            │
│    payment_method│                     │     qty_used (int)               │
│    amt_tendered  │     ┌───────────────┴──────────────────────────────┐   │
│    change_given  │     │              INVENTORY_ITEMS                 │   │
│    qr_reference  │     ├──────────────────────────────────────────────┤   │
│    status        │     │ PK  id                                        │   │
└──────────────────┘     │     name, unit, quantity (decimal)           │   │
                         │     low_stock_threshold (decimal)            │◄──┘
┌──────────────────┐     │     author (int)                             │
│   CATEGORIES     │─1:∞─┤                                              │
├──────────────────┤     └──────────────────────────────────────────────┘
│ PK id            │
│    name, author  │
└──────────────────┘
```

### Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| Role → Users | One-to-Many | A role can be assigned to many users |
| User → Orders | One-to-Many | A user (cashier) can create many orders |
| User → Shifts | One-to-Many | A user can have many shifts over time |
| Shift → Orders | One-to-Many | Orders placed during a shift are linked to it |
| Discount → Orders | One-to-Many | A discount code can be applied to many orders |
| Order → OrderItems | One-to-Many | An order contains many line items |
| Order → Payment | One-to-One | Each order has one payment record |
| Product → OrderItems | One-to-Many | A product appears in many order items |
| Category → Products | One-to-Many | A category groups many products |
| Product ↔ InventoryItem | Many-to-Many | Via `product_inventory` pivot (tracks qty_used per product) |

---

## 🗄 Database Schema

### `roles`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | Auto-increment |
| name | varchar | Unique — `admin`, `cashier`, `kitchen`, `customer` |

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| role_id | bigint FK | → roles.id |
| name | varchar | |
| email | varchar | Unique |
| password | varchar | Bcrypt hashed |
| created_at / updated_at | timestamp | |

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | varchar | |
| author | varchar | Name of creator |
| created_at / updated_at | timestamp | |

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| category_id | bigint FK | → categories.id |
| name | varchar | |
| price | decimal(10,2) | |
| image_path | varchar | Nullable — stored in `storage/app/public/products/` |
| author | int | User ID of creator |
| created_at / updated_at | timestamp | |

### `inventory_items`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | varchar | e.g. Mozzarella, Dough |
| unit | varchar | e.g. kg, pcs, liters |
| quantity | decimal(10,2) | Current stock level |
| low_stock_threshold | decimal(10,2) | Alert when quantity falls at or below this value |
| author | int | User ID of creator |
| created_at / updated_at | timestamp | |

### `product_inventory` *(pivot)*
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| product_id | bigint FK | → products.id |
| inventory_item_id | bigint FK | → inventory_items.id |
| qty_used | int | Units of ingredient consumed per product sold |
| author | int | |
| created_at / updated_at | timestamp | |

### `shifts`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | bigint FK | → users.id |
| opening_cash | decimal(10,2) | Cash in drawer at shift start |
| closing_cash | decimal(10,2) | Nullable — actual cash counted at close |
| expected_cash | decimal(10,2) | Nullable — opening cash + cash sales |
| total_sales | decimal(10,2) | Sum of completed order totals |
| total_orders | int | Count of completed orders |
| status | enum | `open`, `closed` |
| opened_at | timestamp | |
| closed_at | timestamp | Nullable |
| notes | text | Nullable |
| created_at / updated_at | timestamp | |

### `discounts`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | varchar | Display name |
| promo_code | varchar(50) | Unique, uppercase |
| type | enum | `fixed`, `percent` |
| value | decimal(10,2) | Amount or percentage |
| usage_limit | int | Nullable — max redemptions |
| usage_count | int | Times redeemed so far |
| is_active | boolean | Toggle on/off |
| expires_at | timestamp | Nullable |
| created_by | bigint FK | → users.id |
| created_at / updated_at | timestamp | |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | bigint FK | → users.id |
| discount_id | bigint FK | Nullable → discounts.id |
| shift_id | bigint FK | Nullable → shifts.id |
| queue_number | int | Resets daily |
| order_source | varchar | `dine-in`, `online`, `walk-in` |
| status | varchar | `pending`, `preparing`, `ready`, `completed`, `cancelled` |
| total_amount | decimal(10,2) | subtotal − discount + tax |
| discount_amount | decimal(10,2) | Computed discount value |
| tax_amount | decimal(10,2) | Computed tax value |
| notes | text | Nullable — special instructions |
| called_at | timestamp | Nullable — set when status → `ready` |
| refunded_at | timestamp | Nullable — set on refund |
| created_at / updated_at | timestamp | |

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| order_id | bigint FK | → orders.id |
| product_id | bigint FK | → products.id |
| quantity | int | |
| unit_price | decimal(10,2) | Price snapshot at time of order |
| created_at / updated_at | timestamp | |

### `payments`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| order_id | bigint FK | → orders.id (unique) |
| payment_method | varchar | `cash`, `qr`, `card` |
| amount_tendered | decimal(10,2) | Amount given by customer |
| change_given | decimal(10,2) | Auto-calculated |
| qr_reference | varchar | Nullable — GCash / Maya reference |
| status | varchar | `pending`, `paid`, `failed` |
| created_at / updated_at | timestamp | |

---

## 🏗 Backend Architecture

### Models & Relationships

```
Role
 └── hasMany(User)

User
 ├── belongsTo(Role)
 ├── hasMany(Order)
 └── hasMany(Shift)

Category
 └── hasMany(Product)

Product
 ├── belongsTo(Category)
 ├── hasMany(OrderItem)
 └── belongsToMany(InventoryItem) via product_inventory
      └── withPivot('qty_used', 'author')

InventoryItem
 └── belongsToMany(Product) via product_inventory

Shift
 ├── belongsTo(User)
 └── hasMany(Order)

Discount
 ├── belongsTo(User, 'created_by')
 └── hasMany(Order)

Order
 ├── belongsTo(User)
 ├── belongsTo(Discount)
 ├── belongsTo(Shift)
 ├── hasMany(OrderItem)
 └── hasOne(Payment)

OrderItem
 ├── belongsTo(Order)
 └── belongsTo(Product)

Payment
 └── belongsTo(Order)
```

### API Controllers

| Controller | Responsibility |
|---|---|
| `AuthController` | register, login (returns Sanctum token), logout, me |
| `RoleController` | Full CRUD for roles |
| `UserController` | Full CRUD for users with hashed password handling |
| `CategoryController` | Full CRUD with product count eager loading |
| `ProductController` | Full CRUD + image upload + attach/detach inventory items |
| `InventoryItemController` | Full CRUD, supports search and low_stock filter |
| `OrderController` | Create order (auto-calculates total, deducts inventory, applies discount), queue view, status update, refund |
| `PaymentController` | Process payment with automatic change calculation, marks order completed, generates receipt |
| `ShiftController` | Open/close shift, current shift lookup, shift history |
| `DiscountController` | Full CRUD + validate promo code endpoint |
| `ReportController` | Daily sales report with top products, payment breakdown, low stock alerts |

### API Endpoints

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer {token}`.

#### Auth (Public)
```
POST   /api/auth/register
POST   /api/auth/login
```

#### Auth (Protected)
```
POST   /api/auth/logout
GET    /api/auth/me
```

#### Roles
```
GET    /api/roles
POST   /api/roles
GET    /api/roles/{id}
PUT    /api/roles/{id}
DELETE /api/roles/{id}
```

#### Users
```
GET    /api/users
POST   /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}
```

#### Categories
```
GET    /api/categories
POST   /api/categories
GET    /api/categories/{id}
PUT    /api/categories/{id}
DELETE /api/categories/{id}
```

#### Products
```
GET    /api/products
POST   /api/products                              # multipart/form-data, supports image upload
GET    /api/products/{id}
POST   /api/products/{id}                         # _method=PUT for multipart update
DELETE /api/products/{id}
POST   /api/products/{id}/inventory               # attach inventory item
DELETE /api/products/{id}/inventory/{itemId}      # detach inventory item
```

#### Inventory Items
```
GET    /api/inventory-items                       # ?search=&low_stock=1
POST   /api/inventory-items
GET    /api/inventory-items/{id}
PUT    /api/inventory-items/{id}
DELETE /api/inventory-items/{id}
```

#### Orders
```
GET    /api/orders                                # paginated
POST   /api/orders                                # creates order, deducts inventory
GET    /api/orders/{id}
DELETE /api/orders/{id}
PATCH  /api/orders/{id}/status
POST   /api/orders/{id}/refund                    # restores inventory, reverses discount usage
GET    /api/orders/queue                          # pending/preparing/ready only
```

#### Payments
```
GET    /api/payments/{payment}/receipt            # structured receipt data
GET    /api/payments                              # paginated
POST   /api/payments                              # processes payment, marks order completed
GET    /api/payments/{id}
PUT    /api/payments/{id}
DELETE /api/payments/{id}
```

#### Shifts
```
GET    /api/shifts                                # paginated history
GET    /api/shifts/current                        # open shift for current user (admin sees any)
POST   /api/shifts/open
POST   /api/shifts/{id}/close
GET    /api/shifts/{id}
```

#### Discounts
```
POST   /api/discounts/validate                    # validate promo code
GET    /api/discounts
POST   /api/discounts
GET    /api/discounts/{id}
PUT    /api/discounts/{id}
DELETE /api/discounts/{id}
```

#### Reports
```
GET    /api/reports/daily                         # ?date=YYYY-MM-DD
```

#### Example — Create Order
```json
{
  "order_source": "dine-in",
  "items": [
    { "product_id": 3, "quantity": 2 },
    { "product_id": 7, "quantity": 1 }
  ],
  "discount_code": "SAVE20",
  "notes": "Extra cheese on pizza",
  "tax_rate": 12
}
```

#### Example — Process Payment
```json
{
  "order_id": 12,
  "payment_method": "cash",
  "amount_tendered": 500.00,
  "qr_reference": null
}
```

---

## 🖥 Frontend Architecture

### Pages

| Route | Page | Role Access | Description |
|---|---|---|---|
| `/login` | Login | All | Email/password login |
| `/dashboard` | Dashboard | All | Today's sales stats, shift banner, top products |
| `/dashboard/orders` | Orders | Admin / Cashier | Admin: table view + create; Cashier: full POS interface |
| `/dashboard/queue` | Kitchen Queue | All | Live kanban board — polls every 10s |
| `/dashboard/products` | Products | Admin | CRUD with image upload and category dropdown |
| `/dashboard/categories` | Categories | Admin | Inline CRUD table |
| `/dashboard/inventory` | Inventory | Admin | CRUD with low stock filter and threshold alerts |
| `/dashboard/payments` | Payments | Admin / Cashier | Process payments, view receipts |
| `/dashboard/shifts` | Shifts | Admin / Cashier | Open/close shift, cash reconciliation, shift history |
| `/dashboard/discounts` | Discounts | Admin | Create and manage promo codes |
| `/dashboard/reports` | Reports | Admin | Daily sales report with date picker |

### Components

#### `components/layout/Sidebar.tsx`
Fixed left sidebar with role-based navigation. Admin sees all modules; cashier sees POS, shifts only; kitchen sees queue only. Displays logged-in user name and role with sign-out button.

#### `components/ui/Modal.tsx`
Reusable modal with backdrop blur, Escape key close, and header/body slots.

#### `components/ui/StatusBadge.tsx`
Color-coded badge for order and payment statuses — `pending` yellow, `preparing` blue, `ready` / `paid` green, `completed` gray, `cancelled` / `failed` red.

#### `components/ui/Pagination.tsx`
Reusable pagination. Accepts `currentPage`, `lastPage`, `onPageChange`. Hidden when only one page.

#### `components/ui/ReceiptModal.tsx`
Thermal-style receipt display with print support. Shows itemized order, discount, tax, payment method, change, and QR reference.

### Services

| Service | Methods |
|---|---|
| `authService` | login, register, logout, me |
| `roleService` | getAll, getById, create, update, delete |
| `categoryService` | getAll, getById, create, update, delete |
| `productService` | getAll, getById, create, update, delete, attachInventory, detachInventory |
| `inventoryService` | getAll (with search/low_stock params), getById, create, update, delete |
| `orderService` | getAll, getById, getQueue, create, updateStatus, refund, delete |
| `paymentService` | getAll, getById, create, update, delete, getReceipt |
| `shiftService` | getAll, getCurrent, open, close, getById |
| `discountService` | getAll, create, update, delete, validate |
| `reportService` | getDaily |

The base Axios instance at `lib/api.ts`:
- Attaches `Authorization: Bearer {token}` from cookies on every request
- Redirects to `/login` on `401 Unauthorized`
- All API calls are proxied through Next.js rewrites (`/api/*` → `http://localhost:8000/api/*`)

### Context

#### `context/AuthContext.tsx`
Global auth state. Provides `user`, `loading`, `login()`, `logout()`. Restores session on refresh by reading the cookie and calling `/api/auth/me`.

---

## 🔐 Authentication

Uses **Laravel Sanctum token-based auth** to support the decoupled Next.js frontend.

1. POST credentials to `/api/auth/login`
2. Laravel returns a plain-text Sanctum token
3. Frontend stores token in an HTTP cookie (7-day expiry)
4. All requests include `Authorization: Bearer {token}`
5. On logout, token deleted server-side and cookie cleared client-side

---

## 👥 Role-Based Access

| Role | Access |
|---|---|
| `admin` | Full access to all modules including reports, discounts, user management |
| `cashier` | POS orders page, shift management, payments |
| `kitchen` | Kitchen queue only |
| `customer` | No dashboard access |

Sidebar navigation is filtered per role. The orders page renders a different component for admin vs cashier.

---

## 🚀 Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- npm
- PostgreSQL

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd artisan-pizza
```

### 2. Backend Setup

```bash
cd artisan-pizza-backend

composer install

cp .env.example .env
# Edit .env — set DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD

php artisan key:generate
php artisan migrate --seed
php artisan storage:link

php artisan serve
# Runs at http://localhost:8000
```

### 3. Frontend Setup

```bash
cd ../artisan-pizza-frontend

npm install

# .env.local already contains:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

npm run dev
# Runs at http://localhost:3000
```

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@artisanpizza.com | password |
| Cashier | cashier@artisanpizza.com | password |

> ⚠️ Change these credentials immediately in any production environment.

---

## 🌐 Environment Variables

### Backend — `.env`

```env
APP_NAME="Artisan Pizza"
APP_ENV=local
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=artisan
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### Frontend — `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 📦 Migration Order

```
1.  roles
2.  users                    (FK → roles)
3.  categories
4.  products                 (FK → categories)
4b. add_image_to_products
5.  inventory_items
6.  product_inventory        (FK → products, inventory_items)
7.  orders                   (FK → users)
8.  order_items              (FK → orders, products)
9.  payments                 (FK → orders)
10. support tables           (sessions, password_reset_tokens)
11. cache/jobs tables
12. personal_access_tokens   (Sanctum)
13. shifts                   (FK → users)
14. discounts                (FK → users)
15. add_pos_fields           (shift_id FK on orders, discount_id FK on orders)
```

---

## 🧑‍💻 Developer Notes

- All API responses return JSON — no Blade views used anywhere.
- `order_items.unit_price` snapshots the product price at order time for historical accuracy.
- `orders.queue_number` resets daily via `whereDate('created_at', today())->max('queue_number')`.
- `orders.called_at` is set automatically when status transitions to `ready`.
- `orders.refunded_at` is set on refund; inventory is restored and discount usage is decremented.
- Inventory is auto-deducted on order creation based on `product_inventory.qty_used` per item quantity.
- `inventory_items.is_low_stock` is a computed appended attribute — no DB column.
- Kitchen Queue polls `/api/orders/queue` every 10 seconds and plays a beep tone when new orders arrive.
- `ShiftController@current` returns the latest open shift — admins see any open shift, cashiers only see their own.
- `POST /discounts/validate` is declared before `apiResource('discounts')` to prevent Laravel matching `validate` as a discount ID.
- Product images are stored via Laravel's public disk (`storage/app/public/products/`) and served at `/storage/products/...`. Run `php artisan storage:link` once after setup.
- CORS is configured in `config/cors.php` to allow requests from `FRONTEND_URL` only.
- The cashier POS page renders a split-panel layout (menu grid + cart) separate from the admin orders table view — both share the same route `/dashboard/orders` and are switched by role.

---

## 📄 License

MIT License — built for Artisan Pizza internal operations.
