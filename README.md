# LocalBite — Restaurant Admin Panel MVP
## Complete Project Document

---

## The Core Cycle

```
Owner registers → sets up restaurant → builds menu → receives orders → manages orders
```

Everything in this MVP exists to complete this cycle. Nothing more.

---

## Roles

| Role    | Access |
|---------|--------|
| OWNER   | Everything |
| MANAGER | Menu, Orders, Dashboard |
| CASHIER | Orders only (view + create manual orders) |

---

## Pages Overview

```
AUTH
/register
/login
/onboarding

DASHBOARD
/dashboard
/dashboard/menu
/dashboard/menu/categories
/dashboard/menu/items
/dashboard/menu/variants
/dashboard/orders
/dashboard/orders/new
/dashboard/orders/[id]
/dashboard/settings
```

**Total: 12 pages**

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ App Router + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js (Auth.js v5) |
| Database | Prisma + Supabase (PostgreSQL) |
| File Uploads | Uploadthing (item images) + Supabase Storage (logo, cover) |
| Email | Resend |
| Deployment | Vercel |

---

## Folder Structure

```
localbite-admin/
├── prisma/
│   └── schema.prisma
│
├── public/
│   └── logo.png
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── onboarding/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── menu/
│   │   │   │   │   ├── page.tsx             (redirects to /menu/items)
│   │   │   │   │   ├── categories/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── items/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── variants/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx                   (sidebar + header)
│   │   │
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx                         (landing page)
│   │
│   ├── components/
│   │   ├── ui/                              (shadcn components)
│   │   │
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   │
│   │   ├── onboarding/
│   │   │   ├── step-one.tsx
│   │   │   ├── step-two.tsx
│   │   │   └── step-three.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── overview/
│   │   │   │   ├── stats-cards.tsx
│   │   │   │   └── recent-orders-table.tsx
│   │   │   ├── menu/
│   │   │   │   ├── categories/
│   │   │   │   │   ├── category-list.tsx
│   │   │   │   │   └── category-drawer.tsx
│   │   │   │   ├── items/
│   │   │   │   │   ├── items-grid.tsx
│   │   │   │   │   ├── item-card.tsx
│   │   │   │   │   └── item-drawer.tsx
│   │   │   │   └── variants/
│   │   │   │       ├── variants-list.tsx
│   │   │   │       └── variant-drawer.tsx
│   │   │   ├── orders/
│   │   │   │   ├── kanban-board.tsx
│   │   │   │   ├── kanban-column.tsx
│   │   │   │   ├── order-card.tsx
│   │   │   │   ├── order-detail.tsx
│   │   │   │   └── new-order-form.tsx
│   │   │   └── settings/
│   │   │       ├── restaurant-info-tab.tsx
│   │   │       ├── service-tab.tsx
│   │   │       ├── hours-tab.tsx
│   │   │       └── payment-tab.tsx
│   │   │
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── menu-categories.ts
│   │   ├── menu-items.ts
│   │   ├── menu-variants.ts
│   │   ├── orders.ts
│   │   └── settings.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── resend.ts
│   │   ├── uploadthing.ts
│   │   └── utils.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── middleware.ts
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────

enum Role {
  OWNER
  MANAGER
  CASHIER
}

enum SpicyLevel {
  NONE
  MILD
  MEDIUM
  HOT
}

enum FoodType {
  VEG
  NON_VEG
}

enum OrderType {
  DINE_IN
  TAKEAWAY
  DELIVERY
}

enum OrderStatus {
  NEW
  CONFIRMED
  PREPARING
  READY
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  CASH
  CARD
  ONLINE
}

enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
}

enum ServiceType {
  DINE_IN
  TAKEAWAY
  DELIVERY
}

// ─── RESTAURANT ───────────────────────────────────────

model Restaurant {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String?
  cuisineType     String
  city            String
  address         String?
  phone           String
  logoUrl         String?
  coverImageUrl   String?
  isOpen          Boolean  @default(true)

  // service types
  dineIn          Boolean  @default(true)
  takeaway        Boolean  @default(true)
  delivery        Boolean  @default(false)
  deliveryFee     Float    @default(0)
  minimumOrder    Float    @default(0)
  estimatedTime   Int      @default(30)  // in minutes

  // payment methods accepted
  acceptsCash     Boolean  @default(true)
  acceptsCard     Boolean  @default(false)
  acceptsOnline   Boolean  @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // relations
  users           User[]
  categories      Category[]
  menuItems       MenuItem[]
  addonGroups     AddonGroup[]
  orders          Order[]
  operatingHours  OperatingHours[]
}

// ─── USER ─────────────────────────────────────────────

model User {
  id           String     @id @default(cuid())
  name         String
  email        String     @unique
  password     String
  role         Role       @default(CASHIER)
  isActive     Boolean    @default(true)
  lastActiveAt DateTime?

  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])

  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

// ─── OPERATING HOURS ──────────────────────────────────

model OperatingHours {
  id           String     @id @default(cuid())
  day          Int        // 0 = Sunday, 1 = Monday ... 6 = Saturday
  isOpen       Boolean    @default(true)
  openTime     String     // "09:00"
  closeTime    String     // "23:00"

  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
}

// ─── CATEGORY ─────────────────────────────────────────

model Category {
  id           String     @id @default(cuid())
  name         String
  sortOrder    Int        @default(0)
  isVisible    Boolean    @default(true)

  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])

  menuItems    MenuItem[]

  createdAt    DateTime   @default(now())
}

// ─── MENU ITEM ────────────────────────────────────────

model MenuItem {
  id              String     @id @default(cuid())
  name            String
  description     String?
  basePrice       Float
  spicyLevel      SpicyLevel @default(NONE)
  foodType        FoodType   @default(NON_VEG)
  preparationTime Int        @default(15)   // in minutes
  isAvailable     Boolean    @default(true)
  isBestseller    Boolean    @default(false)
  isNew           Boolean    @default(false)
  sortOrder       Int        @default(0)

  categoryId      String
  category        Category   @relation(fields: [categoryId], references: [id])

  restaurantId    String
  restaurant      Restaurant @relation(fields: [restaurantId], references: [id])

  images          MenuItemImage[]
  variants        Variant[]
  orderItems      OrderItem[]

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}

// ─── MENU ITEM IMAGE ──────────────────────────────────

model MenuItemImage {
  id         String   @id @default(cuid())
  url        String
  sortOrder  Int      @default(0)

  menuItemId String
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
}

// ─── VARIANT ──────────────────────────────────────────
// example: Half / Full for Biryani
// example: Single / Double Patty for Burger

model Variant {
  id         String     @id @default(cuid())
  name       String     // "Half", "Full", "Single", "Double"
  price      Float
  isDefault  Boolean    @default(false)

  menuItemId String
  menuItem   MenuItem   @relation(fields: [menuItemId], references: [id], onDelete: Cascade)

  orderItemVariants OrderItemVariant[]
}

// ─── ADDON GROUP ──────────────────────────────────────
// example: "Extras" group containing Extra Raita, Extra Naan

model AddonGroup {
  id           String     @id @default(cuid())
  name         String     // "Extras", "Drinks with meal"
  isRequired   Boolean    @default(false)
  isMultiple   Boolean    @default(true)  // can select multiple addons

  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])

  addons       Addon[]
}

// ─── ADDON ────────────────────────────────────────────
// example: Extra Raita Rs.50, Extra Naan Rs.60

model Addon {
  id           String     @id @default(cuid())
  name         String
  price        Float

  addonGroupId String
  addonGroup   AddonGroup @relation(fields: [addonGroupId], references: [id], onDelete: Cascade)

  orderItemAddons OrderItemAddon[]
}

// ─── ORDER ────────────────────────────────────────────

model Order {
  id             String        @id @default(cuid())
  orderNumber    Int           // auto increment readable number like 1042
  type           OrderType
  status         OrderStatus   @default(NEW)
  paymentMethod  PaymentMethod @default(CASH)
  paymentStatus  PaymentStatus @default(PENDING)

  // customer info (no account needed)
  customerName   String
  customerPhone  String
  customerAddress String?      // only for delivery orders
  specialNotes   String?

  // pricing
  subtotal       Float
  deliveryFee    Float         @default(0)
  discount       Float         @default(0)
  total          Float

  restaurantId   String
  restaurant     Restaurant    @relation(fields: [restaurantId], references: [id])

  items          OrderItem[]

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

// ─── ORDER ITEM ───────────────────────────────────────

model OrderItem {
  id         String   @id @default(cuid())
  quantity   Int
  unitPrice  Float    // price at time of order (important — menu price can change later)
  totalPrice Float

  orderId    String
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  menuItemId String
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id])

  variant    OrderItemVariant?
  addons     OrderItemAddon[]
}

// ─── ORDER ITEM VARIANT ───────────────────────────────

model OrderItemVariant {
  id          String    @id @default(cuid())
  name        String    // snapshot of variant name at time of order
  price       Float     // snapshot of price at time of order

  orderItemId String    @unique
  orderItem   OrderItem @relation(fields: [orderItemId], references: [id], onDelete: Cascade)

  variantId   String
  variant     Variant   @relation(fields: [variantId], references: [id])
}

// ─── ORDER ITEM ADDON ─────────────────────────────────

model OrderItemAddon {
  id          String    @id @default(cuid())
  name        String    // snapshot of addon name at time of order
  price       Float     // snapshot of price at time of order

  orderItemId String
  orderItem   OrderItem @relation(fields: [orderItemId], references: [id], onDelete: Cascade)

  addonId     String
  addon       Addon     @relation(fields: [addonId], references: [id])
}
```

---

## Page by Page Breakdown

---

### /register

**Who:** Owner only (public page)

**What it does:**
- Owner enters their name, email, password
- Restaurant is created automatically on register with a generated slug
- Owner is created with OWNER role
- Default operating hours created (9am to 11pm, all days)
- Redirect to /onboarding after success

**Fields:**
```
Your Name         (text)
Email             (email)
Password          (password)
Confirm Password  (password)
Restaurant Name   (text)
```

---

### /login

**Who:** All roles (public page)

**What it does:**
- Email and password login
- Role based redirect after success:
  - OWNER → /dashboard
  - MANAGER → /dashboard
  - CASHIER → /dashboard/orders

---

### /onboarding

**Who:** Owner only — shown once after register

**Step 1 — Restaurant Info:**
```
Restaurant Name   (pre-filled from register)
Cuisine Type      (dropdown: Pakistani, Chinese, Fast Food, BBQ, Pizza, Desserts, Cafe, Other)
City              (text)
Full Address      (textarea)
Phone Number      (text)
```

**Step 2 — Identity:**
```
Logo              (Supabase Storage upload)
Cover Image       (Supabase Storage upload)
Short Description (textarea — shown on storefront)
```

**Step 3 — Services:**
```
Dine In     (toggle)
Takeaway    (toggle)
Delivery    (toggle)
  └── if delivery on:
      Delivery Fee      (number)
      Minimum Order     (number)
      Estimated Time    (number — in minutes)
```

**Step 4 — Operating Hours:**
```
For each day (Mon to Sun):
  Open/Closed toggle
  Opening time
  Closing time
```

After step 4 → redirect to /dashboard/menu/items

---

### /dashboard

**Who:** Owner + Manager

**Content:**

Stats Cards Row:
```
Total Orders Today
Revenue Today (Rs.)
Pending Orders (needs action — links to orders page)
Average Order Value
```

Order Status Summary:
```
New: 5    Confirmed: 3    Preparing: 8    Ready: 2
```

Recent Orders Table:
```
Columns: Order#  |  Type  |  Customer  |  Items  |  Total  |  Status  |  Time
Each row clickable → goes to /dashboard/orders/[id]
```

Quick Actions:
```
+ New Manual Order  → /dashboard/orders/new
View All Pending    → /dashboard/orders?status=NEW
```

---

### /dashboard/menu/categories

**Who:** Owner + Manager

**Layout:**
```
Header:
  "Categories"         Add Category button (opens drawer)

Table:
  Name | Items Count | Visible | Sort Order | Actions
  ─────────────────────────────────────────────────────
  Starters    | 6  | visible  | 1 | edit  delete
  Mains       | 12 | visible  | 2 | edit  delete
  BBQ         | 8  | visible  | 3 | edit  delete
  Drinks      | 5  | visible  | 4 | edit  delete
  Desserts    | 4  | hidden   | 5 | edit  delete
```

Add/Edit Category Drawer:
```
Category Name   (text — required)
Sort Order      (number)
Visible         (toggle)
```

Rules:
- Cannot delete category that has menu items inside
- Reorder by changing sort order number

---

### /dashboard/menu/items

**Who:** Owner + Manager

**Layout:**
```
Left Panel — Category Filter:
  All Items
  Starters (6)
  Mains (12)
  BBQ (8)
  Drinks (5)
  Desserts (4)

Right Panel:
  Search box           Add New Item button (opens drawer)
  ─────────────────────────────────────────────────────
  Grid of item cards
```

Item Card shows:
```
┌─────────────────────┐
│ [item image]        │
│ Chicken Karahi      │
│ Mains               │
│ Rs. 1,200           │
│ ● Available    [edit]│
└─────────────────────┘
```

Add / Edit Item Drawer:
```
Item Name           (text — required)
Description         (textarea)
Category            (dropdown — required)
Base Price          (number — required)
Food Type           (toggle: Veg / Non-Veg)
Spicy Level         (select: None / Mild / Medium / Hot)
Preparation Time    (number — in minutes)
Tags                (checkboxes: Bestseller, New Arrival)
Images              (Uploadthing — up to 4 images)
Available           (toggle)
```

---

### /dashboard/menu/variants

**Who:** Owner + Manager

**What this page manages:**
Variants are size or option differences for a single item with different prices.

**Layout:**
```
Select Menu Item    (dropdown — search and select item)

After selecting item:
  Item name shown
  "Variants for: Biryani"

  Variants Table:
  Name     | Price   | Default | Actions
  ─────────────────────────────────────
  Half     | Rs.450  | No      | edit delete
  Full     | Rs.800  | Yes     | edit delete

  + Add Variant button (opens small drawer)

  ─────────────────────────────────────
  "Add-on Groups for: Biryani"

  Addon Groups:
  Group Name  | Required | Multiple | Addons Count | Actions
  ──────────────────────────────────────────────────────────
  Extras      | No       | Yes      | 3            | manage edit delete

  + Add Addon Group button

  On clicking "manage" for a group:
  Shows addons inside that group:
  Name           | Price  | Actions
  ─────────────────────────────────
  Extra Raita    | Rs.50  | edit delete
  Extra Naan     | Rs.60  | edit delete
  Extra Sauce    | Rs.30  | edit delete

  + Add Addon button
```

Add Variant Drawer:
```
Variant Name  (text — example: Half, Full, Small, Large)
Price         (number)
Set as Default (toggle)
```

Add Addon Group Drawer:
```
Group Name    (text — example: Extras, Drinks with meal)
Required      (toggle — must customer select from this group)
Multiple      (toggle — can customer select more than one)
```

Add Addon Drawer:
```
Addon Name   (text — example: Extra Raita)
Price        (number)
```

---

### /dashboard/orders

**Who:** Owner + Manager + Cashier

**Layout:**
```
Top Bar:
  Filter tabs: All | New | Confirmed | Preparing | Ready | Completed | Cancelled
  Filter by type: All | Dine In | Takeaway | Delivery
  + New Order button → /dashboard/orders/new

Kanban Board:
  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌───────┐ ┌──────────┐
  │   NEW    │ │ CONFIRMED │ │PREPARING │ │ READY │ │COMPLETED │
  │          │ │           │ │          │ │       │ │          │
  │ #1045    │ │ #1043     │ │ #1041    │ │ #1039 │ │ #1037    │
  │ Ahmed    │ │ Sara      │ │ Usman    │ │ Ali   │ │ Fatima   │
  │ Delivery │ │ Takeaway  │ │ Dine In  │ │Takeaway│ │ Delivery│
  │ 3 items  │ │ 2 items   │ │ 5 items  │ │1 item │ │ 2 items  │
  │ Rs.1,450 │ │ Rs.890    │ │ Rs.2,100 │ │Rs.650 │ │ Rs.980   │
  │ 5m ago   │ │ 12m ago   │ │ 25m ago  │ │35m ago│ │ 1hr ago  │
  └──────────┘ └───────────┘ └──────────┘ └───────┘ └──────────┘

Each card is clickable → goes to /dashboard/orders/[id]
New orders show sound alert + flash animation
Orders waiting too long turn card border red
```

---

### /dashboard/orders/[id]

**Who:** Owner + Manager + Cashier

**Layout:**
```
Back button ← All Orders

Left Column — Order Info:
  Order #1045
  Placed: 2:45 PM, today
  Type: Delivery 🛵
  Status badge: NEW

  Customer:
  Ahmed Ali
  0300-1234567
  House 12, Street 4, DHA Lahore

  Special Notes:
  "Extra spicy please, no onions in karahi"

Right Column — Items:
  2x Chicken Karahi (Full)         Rs. 2,400
      + Extra Raita                Rs.    50
      + Extra Naan                 Rs.    60

  1x Seekh Kabab (6 pieces)        Rs.   650

  ──────────────────────────────────────────
  Subtotal                         Rs. 3,160
  Delivery Fee                     Rs.   100
  Discount                         Rs.     0
  ──────────────────────────────────────────
  Total                            Rs. 3,260

  Payment: Cash on Delivery | PENDING

Bottom Actions:
  [Cancel Order]    [Confirm Order]

  (buttons change based on current status)
  NEW       → Cancel | Confirm
  CONFIRMED → Cancel | Mark Preparing
  PREPARING → Mark Ready
  READY     → Mark Completed
  COMPLETED → (no actions — show Print Receipt)
  CANCELLED → (no actions)
```

---

### /dashboard/orders/new

**Who:** Owner + Manager + Cashier

**What it does:**
Creates a manual order for walk-in or phone customers

**Step 1 — Order Type:**
```
Dine In   Takeaway   Delivery
(select one)
```

**Step 2 — Customer Info:**
```
If Takeaway or Delivery:
  Customer Name    (text)
  Customer Phone   (text)

If Delivery:
  Delivery Address (textarea)

If Dine In:
  Customer Name    (text — optional)
```

**Step 3 — Build Order:**
```
Left side — Menu Browser:
  Category tabs
  Item cards with + button
  Clicking item:
    - if has variants → show variant selector popup
    - if has addons → show addon selector popup
    - add to order

Right side — Current Order:
  Item list with quantities
  Each item shows selected variant and addons
  + / - quantity buttons
  Remove item button
  ────────────────────
  Subtotal: Rs. X
  Delivery Fee: Rs. X
  Total: Rs. X

  Payment Method:
  Cash | Card | Online
```

**Step 4 — Place Order:**
```
Review summary
Place Order button
→ order created with CONFIRMED status (manual orders skip NEW)
→ redirect to /dashboard/orders/[newOrderId]
```

---

### /dashboard/settings

**Who:** Owner only

**Tab 1 — Restaurant Info:**
```
Restaurant Name
Cuisine Type
City
Full Address
Phone Number
Description
Logo (change upload)
Cover Image (change upload)
```

**Tab 2 — Services and Delivery:**
```
Dine In         (toggle)
Takeaway        (toggle)
Delivery        (toggle)
Delivery Fee    (number)
Minimum Order   (number)
Estimated Time  (number)
```

**Tab 3 — Operating Hours:**
```
For each day:
  Day name | Open/Closed toggle | Opening time | Closing time
```

**Tab 4 — Payment Methods:**
```
Accept Cash     (toggle)
Accept Card     (toggle)
Accept Online   (toggle)
```

**Danger Zone:**
```
Temporarily Close Restaurant (toggle — instant open/close)
```

---

## Sidebar Navigation by Role

```
OWNER sees:                MANAGER sees:           CASHIER sees:
─────────────              ─────────────────       ─────────────
Dashboard                  Dashboard               Orders
Menu                       Menu
  Categories                 Categories
  Items                      Items
  Variants                   Variants
Orders                     Orders
Settings                   (no settings)
```

---

## Server Actions List

```
actions/auth.ts
  registerOwner(data)
  loginUser(data)
  logoutUser()

actions/menu-categories.ts
  createCategory(data)
  updateCategory(id, data)
  deleteCategory(id)
  reorderCategories(ids)
  toggleCategoryVisibility(id)

actions/menu-items.ts
  createMenuItem(data)
  updateMenuItem(id, data)
  deleteMenuItem(id)
  toggleItemAvailability(id)
  duplicateMenuItem(id)

actions/menu-variants.ts
  createVariant(menuItemId, data)
  updateVariant(id, data)
  deleteVariant(id)
  setDefaultVariant(id)
  createAddonGroup(restaurantId, data)
  updateAddonGroup(id, data)
  deleteAddonGroup(id)
  createAddon(groupId, data)
  updateAddon(id, data)
  deleteAddon(id)

actions/orders.ts
  createManualOrder(data)
  updateOrderStatus(id, status)
  cancelOrder(id)
  getOrdersByStatus(restaurantId, status)

actions/settings.ts
  updateRestaurantInfo(data)
  updateServiceSettings(data)
  updateOperatingHours(data)
  updatePaymentMethods(data)
  toggleRestaurantOpen(restaurantId)
```

---

## Environment Variables Needed

```bash
# .env.local

# Database
DATABASE_URL=""              # Supabase PostgreSQL connection string (pooled)
DIRECT_URL=""                # Supabase direct connection (for migrations)

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""           # generate: openssl rand -base64 32

# Supabase Storage (for logo and cover image)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# Uploadthing (for menu item images)
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""

# Resend (for emails)
RESEND_API_KEY=""
```

---

## Build Order (Phase by Phase)

```
Phase 1 — Setup
  ✓ Install Next.js + TypeScript + Tailwind + shadcn/ui
  ✓ Write complete Prisma schema
  ✓ Connect to Supabase and run first migration
  ✓ Set up folder structure

Phase 2 — Auth
  ✓ /register page and action
  ✓ /login page and action
  ✓ NextAuth configuration
  ✓ Middleware — protect dashboard routes

Phase 3 — Onboarding
  ✓ /onboarding 4 step flow
  ✓ Supabase Storage for logo and cover image
  ✓ Operating hours creation

Phase 4 — Menu Categories
  ✓ /dashboard/menu/categories
  ✓ Create, edit, delete, reorder categories

Phase 5 — Menu Items
  ✓ /dashboard/menu/items
  ✓ Create, edit, delete menu items
  ✓ Uploadthing for item images
  ✓ Toggle availability

Phase 6 — Variants and Addons
  ✓ /dashboard/menu/variants
  ✓ Create variants per item
  ✓ Create addon groups and addons

Phase 7 — Order Management
  ✓ /dashboard/orders (kanban board)
  ✓ /dashboard/orders/[id] (detail + status actions)
  ✓ Status update actions

Phase 8 — Manual Order Creation
  ✓ /dashboard/orders/new
  ✓ 3 step order builder
  ✓ Variant and addon selection in order

Phase 9 — Dashboard Overview
  ✓ /dashboard stats cards
  ✓ Recent orders table

Phase 10 — Settings
  ✓ /dashboard/settings all 4 tabs
  ✓ Supabase Storage for changing logo and cover

Phase 11 — Role Based Access
  ✓ Sidebar shows correct links per role
  ✓ Middleware blocks wrong role from wrong pages
  ✓ Server actions check role before executing
```

---

## MVP Complete Condition

You know this MVP is done when this full cycle works:

```
1. Owner registers and completes onboarding          ✓
2. Owner creates categories (Starters, Mains etc)    ✓
3. Owner adds menu items with images and prices      ✓
4. Owner adds variants and addons to items           ✓
5. Cashier creates a manual order with customizations ✓
6. Order appears in NEW column on kanban board       ✓
7. Manager confirms order → moves to CONFIRMED       ✓
8. Manager updates through to COMPLETED              ✓
9. Dashboard shows today's orders and revenue        ✓
```

When this works end to end — MVP is complete.
Connect your storefront project next and real customer orders will flow in automatically.
```
