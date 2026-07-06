# 🍕 Artisan Pizza POS System

A full-stack Point of Sale (POS) system built for Artisan Pizza — powered by a **Laravel 12 REST API** backend and a **Next.js 15 + TypeScript** frontend. Designed for real-world restaurant operations including order management, kitchen queue display, inventory tracking, and payment processing.

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
- [Getting Started](#-getting-started)
- [Default Credentials](#-default-credentials)
- [Environment Variables](#-environment-variables)

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Backend     | Laravel 12, PHP 8.2                 |
| Auth        | Laravel Sanctum (Token-based)       |
| Database    | PostgreSQL                          |
| ORM         | Eloquent                            |
| Frontend    | Next.js 15 (App Router)             |
| Language    | TypeScript                          |
| Styling     | Tailwind CSS v4                     |
| HTTP Client | Axios                               |
| State       | React Context API                   |

---

## 📁 Project Structure

```
Artisan-Pizza-Backend/
├── artisan-pizza-backend/          # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/
│   │   │           ├── AuthController.php
│   │   │           ├── RoleController.php
│   │   │           ├── UserController.php
│   │   │           ├── CategoryController.php
│   │   │           ├── ProductController.php
│   │   │           ├── InventoryItemController.php
│   │   │           ├── OrderController.php
│   │   │           └── PaymentController.php
│   │   └── Models/
│   │       ├── Role.php
│   │       ├── User.php
│   │       ├── Category.php
│   │       ├── Product.php
│   │       ├── InventoryItem.php
│   │       ├── ProductInventory.php
│   │       ├── Order.php
│   │       ├── OrderItem.php
│   │       └── Payment.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── config/
│       ├── cors.php
│       └── sanctum.php
│
└── artisan-pizza-frontend/         # Next.js App
    ├── app/
    │   ├── login/
    │   │   └── page.tsx
    │   └── dashboard/
    │       ├── page.tsx
    │       ├── layout.tsx
    │       ├── orders/page.tsx
    │       ├── queue/page.tsx
    │       ├── products/page.tsx
    │       ├── categories/page.tsx
    │       ├── inventory/page.tsx
    │       └── payments/page.tsx
    ├── components/
    │   ├── layout/
    │   │   └── Navbar.tsx
    │   └── ui/
    │       ├── StatusBadge.tsx
    │       └── Pagination.tsx
    ├── context/
    │   └── AuthContext.tsx
    ├── lib/
    │   ├── api.ts
    │   └── services/
    │       ├── authService.ts
    │       ├── roleService.ts
    │       ├── categoryService.ts
    │       ├── productService.ts
    │       ├── inventoryService.ts
    │       ├── orderService.ts
    │       └── paymentService.ts
    └── types/
        └── index.ts
```

---

## 🗺 Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────────────────────────────────┐         ┌──────────────────────────────┐
│    ROLES    │         │                  USERS                    │         │            ORDERS             │
├─────────────┤         ├──────────────────────────────────────────┤         ├──────────────────────────────┤
│ PK  id      │──────── │ PK  id                                    │──────── │ PK  id                        │
│     name    │  1   ∞  │ FK  role_id                               │  1   ∞  │ FK  user_id                   │
└─────────────┘         │     name                                  │         │     queue_number (int)        │
                        │     email                                  │         │     order_source (string)     │
                        │     password                               │         │     status (string)           │
                        └──────────────────────────────────────────┘         │     total_amount (decimal)    │
                                                                              │     called_at (timestamp)     │
                                                                              └───────────────┬───────────────┘
                                                                                              │ 1
                                                                              ┌───────────────┴───────────────┐
                              ┌───────────────────┐         ∞                │         ORDER_ITEMS            │
                              │     PAYMENTS      │◄────────────────────────  ├───────────────────────────────┤
                              ├───────────────────┤                           │ PK  id                         │
                              │ PK  id            │                           │ FK  order_id                   │
                              │ FK  order_id      │                           │ FK  product_id                 │
                              │     payment_method│                           │     quantity (int)             │
                              │     amt_tendered  │                           │     unit_price (decimal)       │
                              │     change_given  │                           └───────────────┬───────────────┘
                              │     qr_reference  │                                           │ ∞
                              │     status        │                           ┌───────────────┴───────────────┐
                              │     created_at    │                           │           PRODUCTS             │
                              │     updated_at    │                           ├───────────────────────────────┤
                              └───────────────────┘                           │ PK  id                         │
                                                                              │ FK  category_id                │
                                                                              │     name (string)              │
                                                                              │     price (decimal)            │
┌───────────────────────┐                                                     │     author (int)               │
│      CATEGORIES       │                                                     │     created_at                 │
├───────────────────────┤       1          ∞                                  │     updated_at                 │
│ PK  id                │◄──────────────────────────────────────────────────  └───────────────┬───────────────┘
│     name (string)     │                                                                      │
│     author (string)   │                                                                      │ ∞ (via pivot)
│     created_at        │                                          ┌───────────────────────────┴────────────────┐
│     updated_at        │                                          │            PRODUCT_INVENTORY (pivot)        │
└───────────────────────┘                                          ├────────────────────────────────────────────┤
                                                                   │ PK  id                                      │
                                                                   │ FK  product_id                              │
                                                                   │ FK  inventory_item_id                       │
                                                                   │     qty_used (int)                          │
                                                                   │     author (int)                            │
                                                                   │     created_at                              │
                                                                   │     updated_at                              │
                                                                   └───────────────────────┬─────────────────────┘
                                                                                           │ ∞
                                                                   ┌───────────────────────┴─────────────────────┐
                                                                   │              INVENTORY_ITEMS                 │
                                                                   ├──────────────────────────────────────────────┤
                                                                   │ PK  id                                        │
                                                                   │     name (string)                             │
                                                                   │     unit (string)                             │
                                                                   │     quantity (decimal)                        │
                                                                   │     author (int)                              │
                                                                   │     created_at                                │
                                                                   │     updated_at                                │
                                                                   └──────────────────────────────────────────────┘
```

### Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| Role → Users | One-to-Many | A role can be assigned to many users |
| User → Orders | One-to-Many | A user (cashier) can create many orders |
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
| name | varchar | Unique (admin, cashier, kitchen, customer) |

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| role_id | bigint FK | → roles.id |
| name | varchar | |
| email | varchar | Unique |
| password | varchar | Bcrypt hashed |
| remember_token | varchar | |
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
| author | int | User ID of creator |
| created_at / updated_at | timestamp | |

### `inventory_items`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | varchar | e.g. Mozzarella, Dough |
| unit | varchar | e.g. kg, pcs, liters |
| quantity | decimal(10,2) | Current stock level |
| author | int | User ID of creator |
| created_at / updated_at | timestamp | |

### `product_inventory` *(pivot)*
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| product_id | bigint FK | → products.id |
| inventory_item_id | bigint FK | → inventory_items.id |
| qty_used | int | Quantity of ingredient per product |
| author | int | |
| created_at / updated_at | timestamp | |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | bigint FK | → users.id |
| queue_number | int | Auto-incremented per day |
| order_source | varchar | `dine-in`, `online`, `walk-in` |
| status | varchar | `pending`, `preparing`, `ready`, `completed`, `cancelled` |
| total_amount | decimal(10,2) | Computed from items |
| called_at | timestamp | Nullable — set when status → ready |
| created_at / updated_at | timestamp | |

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| order_id | bigint FK | → orders.id |
| product_id | bigint FK | → products.id |
| quantity | int | |
| unit_price | decimal(10,2) | Snapshot of product price at time of order |
| created_at / updated_at | timestamp | |

### `payments`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| order_id | bigint FK | → orders.id (unique) |
| payment_method | varchar | `cash`, `qr`, `card` |
| amount_tendered | decimal(10,2) | Amount given by customer |
| change_given | decimal(10,2) | Auto-calculated |
| qr_reference | varchar | Nullable — for GCash / Maya |
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
 └── hasMany(Order)

Category
 └── hasMany(Product)

Product
 ├── belongsTo(Category)
 ├── hasMany(OrderItem)
 └── belongsToMany(InventoryItem) via product_inventory
      └── withPivot('qty_used', 'author')

InventoryItem
 └── belongsToMany(Product) via product_inventory

Order
 ├── belongsTo(User)
 ├── hasMany(OrderItem)
 └── hasOne(Payment)

OrderItem
 ├── belongsTo(Order)
 └── belongsTo(Product)

Payment
 └── belongsTo(Order)
```

### API Controllers

Each controller is a dedicated component under `app/Http/Controllers/Api/`:

| Controller | Responsibility |
|---|---|
| `AuthController` | register, login (returns Sanctum token), logout, me |
| `RoleController` | Full CRUD for roles |
| `UserController` | Full CRUD for users with hashed password handling |
| `CategoryController` | Full CRUD with product count eager loading |
| `ProductController` | Full CRUD + attach/detach inventory items to products |
| `InventoryItemController` | Full CRUD for stock items |
| `OrderController` | Create order (auto-calculates total), queue view, status update via PATCH |
| `PaymentController` | Process payment with automatic change calculation, marks order as completed |

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
POST   /api/products
GET    /api/products/{id}
PUT    /api/products/{id}
DELETE /api/products/{id}
POST   /api/products/{id}/inventory              # attach inventory item
DELETE /api/products/{id}/inventory/{itemId}     # detach inventory item
```

#### Inventory Items
```
GET    /api/inventory-items
POST   /api/inventory-items
GET    /api/inventory-items/{id}
PUT    /api/inventory-items/{id}
DELETE /api/inventory-items/{id}
```

#### Orders
```
GET    /api/orders                    # paginated list
POST   /api/orders                    # create order with items array
GET    /api/orders/{id}
DELETE /api/orders/{id}
PATCH  /api/orders/{id}/status        # update status
GET    /api/orders/queue              # active queue (pending/preparing/ready)
```

#### Payments
```
GET    /api/payments
POST   /api/payments                  # process payment, auto-marks order complete
GET    /api/payments/{id}
PUT    /api/payments/{id}
DELETE /api/payments/{id}
```

#### Example — Create Order Request Body
```json
{
  "user_id": 1,
  "order_source": "dine-in",
  "items": [
    { "product_id": 3, "quantity": 2 },
    { "product_id": 7, "quantity": 1 }
  ]
}
```

#### Example — Process Payment Request Body
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

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Email/password login form |
| `/dashboard` | Dashboard | Overview cards for all modules |
| `/dashboard/orders` | Orders | Create orders, view all orders, update status inline |
| `/dashboard/queue` | Kitchen Queue | Live kanban-style board (polls every 10s) — Pending → Preparing → Ready |
| `/dashboard/products` | Products | CRUD with category dropdown and pagination |
| `/dashboard/categories` | Categories | Inline CRUD table |
| `/dashboard/inventory` | Inventory | CRUD for stock items with pagination |
| `/dashboard/payments` | Payments | Process payment with change calculator, QR reference field |

### Components

#### `components/layout/Navbar.tsx`
Top navigation bar with links to all modules, displays logged-in user name and role. Handles logout via `AuthContext`.

#### `components/ui/StatusBadge.tsx`
Color-coded badge for order/payment statuses:
- `pending` → yellow
- `preparing` → blue
- `ready` → green
- `completed` → gray
- `cancelled` / `failed` → red
- `paid` → green

#### `components/ui/Pagination.tsx`
Reusable pagination component. Accepts `currentPage`, `lastPage`, and `onPageChange` callback. Hides itself when there is only one page.

### Services

All API communication is centralized in `lib/services/`. Each service file maps to one backend resource:

| Service | Methods |
|---|---|
| `authService` | login, register, logout, me |
| `roleService` | getAll, getById, create, update, delete |
| `categoryService` | getAll, getById, create, update, delete |
| `productService` | getAll, getById, create, update, delete, attachInventory, detachInventory |
| `inventoryService` | getAll, getById, create, update, delete |
| `orderService` | getAll, getById, getQueue, create, updateStatus, delete |
| `paymentService` | getAll, getById, create, update, delete |

The base Axios instance at `lib/api.ts` automatically:
- Attaches `Authorization: Bearer {token}` from cookies on every request
- Redirects to `/login` on `401 Unauthorized` responses

### Context

#### `context/AuthContext.tsx`
Global authentication state using React Context. Provides:
- `user` — currently logged-in user with role
- `loading` — boolean for auth check on app load
- `login(email, password)` — calls API, stores token in cookie
- `logout()` — calls API, removes cookie, clears user state

Automatically restores session on page refresh by reading the cookie and calling `/api/auth/me`.

---

## 🔐 Authentication

This system uses **Laravel Sanctum token-based authentication** (not cookie/session based) to support the decoupled Next.js frontend.

**Flow:**
1. User POSTs credentials to `/api/auth/login`
2. Laravel returns a plain-text Sanctum API token
3. Frontend stores the token in an HTTP cookie (7-day expiry)
4. All subsequent requests include `Authorization: Bearer {token}` header
5. On logout, token is deleted server-side and cookie is cleared client-side

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
cd Artisan-Pizza-Backend
```

### 2. Backend Setup

```bash
cd artisan-pizza-backend

# Install PHP dependencies
composer install

# Copy and configure environment
cp .env.example .env
# Edit .env — set DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Generate application key
php artisan key:generate

# Run migrations and seed default users
php artisan migrate --seed

# Start development server
php artisan serve
# Runs at http://localhost:8000
```

### 3. Frontend Setup

```bash
cd ../artisan-pizza-frontend

# Install Node dependencies
npm install

# Configure environment
# .env.local already contains:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start development server
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

Migrations are timestamped to run in dependency order:

```
1. roles
2. users              (FK → roles)
3. categories
4. products           (FK → categories)
5. inventory_items
6. product_inventory  (FK → products, inventory_items)
7. orders             (FK → users)
8. order_items        (FK → orders, products)
9. payments           (FK → orders)
10. support tables    (sessions, password_reset_tokens)
11. cache/jobs tables
12. personal_access_tokens (Sanctum)
```

---

## 🧑‍💻 Developer Notes

- All API responses return JSON. Controllers use `response()->json()` throughout — no Blade views are used.
- The `order_items.unit_price` column snapshots the product price at time of order, ensuring historical accuracy even if the product price changes later.
- The `orders.queue_number` resets daily (uses `whereDate('created_at', today())->max('queue_number')`).
- The `called_at` timestamp on orders is automatically set when status is updated to `ready`.
- The Kitchen Queue page polls the `/api/orders/queue` endpoint every **10 seconds** for live updates without requiring WebSockets.
- The `product_inventory` table is a proper pivot with extra columns (`qty_used`, `author`), exposed via Eloquent's `withPivot()`.
- CORS is configured in `config/cors.php` to allow requests from `FRONTEND_URL` only.

---

## 📄 License

MIT License — built for Artisan Pizza internal operations.
