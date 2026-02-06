Inventory System – Feature Rollout Map (Offline Shopping + Android Companion App)

Phase 1 — Backend Data Model Extensions
- Add new fields to the items collection:
  - preferred_store (string, optional)
  - in_cart (boolean)
  - cart_mode (enum: "auto" | "manual" | null)
- Add indexes for:
  - in_cart
  - cart_mode
  - preferred_store
- Update Appwrite permissions to allow user updates to these fields
- Add validation rules:
  - cart_mode must be "auto", "manual", or null
  - in_cart must be boolean

Phase 2 — Backend Logic for Auto‑Cart
- Define auto‑cart rule:
  - If quantity < Min_Stock → set in_cart = true and cart_mode = "auto"
- Implement auto‑cart logic:
  - Option A: Appwrite function triggered on item update
  - Option B: Client‑side logic (web + app)
- Ensure manual overrides:
  - If cart_mode = "manual", auto logic must not overwrite it

Phase 3 — Web Frontend Updates
- Add UI controls in item forms:
  - Preferred store field
  - “Add to cart” toggle
- Add a new Shopping View page:
  - Shows items where in_cart = true
  - Group by preferred store
  - Show auto/manual badge
  - Allow quantity adjustments
  - Allow removing from cart
- Add “Send to cart” button in table/card views
- Add “Clear cart” action (manual items only)

Phase 4 — Web UX Enhancements
- Add cart indicators in:
  - Table rows
  - Card view
  - Quick Update View
- Add sorting/filtering:
  - By preferred store
  - By auto/manual
- Add optional Shopping Mode:
  - Large buttons
  - Mobile‑friendly layout
  - Quick quantity adjustments

Phase 5 — Android App (Online‑Only Prototype)
- Build minimal app:
  - Login with Appwrite
  - Fetch items
  - Display shopping list
  - Update quantities
  - Toggle in_cart
- Use direct Appwrite API calls
- Validate permissions and data consistency

Phase 6 — Android App Offline Foundation
- Add local database (SQLite / WatermelonDB / Room)
- Add local item cache:
  - Full inventory snapshot
  - Shopping list subset
- Add sync queue:
  - Pending updates
  - Pending adds
  - Pending deletes
- Add connectivity detection:
  - Online → sync
  - Offline → queue

Phase 7 — Android App Offline Shopping Mode
- Add offline shopping list UI:
  - Tick items as purchased
  - Adjust quantities
  - Add unexpected items
- Add offline add/edit/delete:
  - Temporary local IDs for new items
  - Local edits stored in queue
  - Local deletes marked as pending
- Add conflict handling:
  - Last write wins
  - Preserve auto/manual cart mode

Phase 8 — Android App Sync Engine
- Implement sync rules:
  - Upload pending changes
  - Download fresh inventory
  - Resolve conflicts
- Add retry logic:
  - Exponential backoff
  - Manual “sync now” button
- Add sync status indicators:
  - Pending changes count
  - Last sync timestamp

Phase 9 — Polish and Optional Features
- Barcode scanning for adding/updating items
- Store‑based shopping mode
- Offline notifications for unsynced changes
- Online notifications for auto‑cart events
- Optional WearOS companion

Phase 10 — Deployment
- Internal APK distribution (free)
- Optional Google Play release (£25 one‑time)
- Versioning aligned with backend schema
- Documentation for:
  - API usage
  - Sync rules
  - Offline behavior
