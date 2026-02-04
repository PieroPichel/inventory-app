# Household Inventory App

A mobile‑first, multi‑household inventory management system built with React + Appwrite.  
Designed for fast item tracking, expiry alerts, and secure invite‑only access.

---

## 🚀 Features

- Multi‑house support (each user can belong to multiple houses)
- Add, edit, delete inventory items
- Category + subcategory system
- Expiry alerts (Expired / Soon / Low Stock)
- Table view + Card view
- CSV export (normal + admin export)
- Release notes viewer
- Secure authentication (Appwrite)
- Protected routes
- Mobile‑first UI

---

## 🏗️ Tech Stack

- **React** (Vite)
- **Appwrite** (Auth + Database)
- **Custom Hooks** for data loading
- **Modular Components** for UI
- **CSV Export Utilities**

---

## 📁 Project Structure

src/
├── App.jsx                                  # Main app + routing
├── App.css                                  # Global styles
├── appwrite.js                          # Appwrite client setup
├── main.jsx                                # React entry point
├── version.js                            # App version
├── releaseNotes.js                  # Release notes data
├── todo.js                                  # Personal notes (not used by app)

├── components/             # UI components
│   ├── alertUtils.jsx                    # Alert badges + sorting logic
│   ├── CategorySelect.jsx            # Category dropdown
│   ├── SubcategorySelect.jsx      # Subcategory dropdown
│   ├── InventoryAddForm.jsx        # Add item form
│   ├── InventoryEditForm.jsx      # Edit item form
│   ├── InventoryCard.jsx              # Card view item
│   ├── InventoryRow.jsx                # Table row item
│   ├── InventoryTable.jsx            # Main inventory list
│   ├── ViewModeSelector.jsx        # Toggle table/card view
│   ├── SharedModal.jsx                  # Reusable modal
│   ├── ProtectedRoute.jsx            # Auth guard
│   └── TopBar.jsx                            # Header bar + house selector

├── utils/                  # Logic + hooks
│   ├── exportUtils.js                    # CSV export logic
│   ├── itemActions.js                    # Increase/decrease/delete
│   ├── useCategoryData.js            # Load categories + subcategories
│   └── useInventoryItems.js        # Load items + pagination

├── pages/                  # Route-level screens
│   ├── Login.jsx
│   └── Register.jsx

└── lib/                    # Reserved for future pure logic


---

## 🧩 Key Concepts

### 🔐 Authentication
- Users register/login via Appwrite
- ProtectedRoute ensures only authenticated users access inventory

### 🏠 Multi‑House Support
- `user_houses` collection links users → houses
- TopBar loads houses for the current user
- Inventory is filtered by selected house

### 📦 Inventory Items
Each item includes:
- Category + subcategory
- Quantity + min stock
- Expiry date
- Storage location
- House ID

### ⚠️ Alerts
- Expired  
- Expiring soon  
- Low stock  

Handled by `alertUtils.jsx`.

### 📤 CSV Export
- Normal export: items only  
- Admin export: houses, categories, subcategories, items, user_houses  

---

## 🛠️ Developer Onboarding Guide

### 1️⃣ Clone the repo

git clone https://github.com/YOUR_REPO/inventory-app.git (github.com in Bing)
cd inventory-app


### 2️⃣ Install dependencies

npm install


### 3️⃣ Configure Appwrite

Create `.env`:

VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT=xxxxx


### 4️⃣ Start dev server

npm run dev

### 5️⃣ Appwrite Setup Required

Collections:

- `houses`
- `inventory_categories`
- `inventory_subcategory`
- `inventory_items`
- `user_houses`

Indexes recommended:

- `user_houses.userId`
- `inventory_items.houseId`
- `inventory_subcategory.categoryId`

### 6️⃣ Build for production

npm run build


---

## 🧭 Recommended Workflow

1. Create a **dev branch**
2. Test changes locally (`npm run dev`)
3. Push → Vercel Preview Deployment
4. Verify preview
5. Merge to main → Production deploy

---

## 🧩 Future Improvements

- Barcode scanning
- Offline mode
- Push notifications for expiry
- Multi‑user roles (admin / member)
- House invitations via email

---

## 📄 License

Private project — not licensed for redistribution.
