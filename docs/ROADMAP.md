🧭 ROADMAP – Household Inventory (Web + Android)
1. Web App – Stabilisation & Final Polish
Complete feature alignment between Card and Table views (Qty/Min controls, Cart switch, alerts).

Improve UX consistency: tooltips, low‑stock highlighting, confirmation dialogs for deletes.

Maintain multi‑house support (house selector, logout, version info).

No new major features planned; web app becomes the “admin + onboarding” interface.

2. Android App – v1 (Card‑View‑Focused, Offline‑First)
Authentication: Login only (no registration). After login, user selects which house they have access to.

Main UI: Card View becomes the primary interface (Qty/Min controls, Cart switch, alerts, Stores, Location, Expiry).

Filters & Sorting: Category, Location, Store filters; alphabetical sorting.

Offline‑First: Local database for browsing and editing inventory without internet. Sync changes to Appwrite when connection returns.

Feature Parity: Edit/Delete items, adjust Qty/Min, toggle Cart mode, view alerts — matching web behaviour.

3. Android App – v2+ Enhancements
Optional registration flow on mobile.

Barcode scanning, push notifications, compact mode, improved visuals.

Shared logic package between web and mobile for alerts, item actions, and sorting.

Advanced sync conflict handling and optional shopping list export.
