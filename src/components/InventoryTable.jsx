import { useState, useEffect, useMemo } from "react";
import useCategoryData from "../utils/useCategoryData";
import useInventoryItems from "../utils/useInventoryItems";
import ReceiptScanner from "./ReceiptScanner";
import { getDateBounds, getAlertStatus, getAlertBadge } from "./alertUtils";
import { increaseQty, decreaseQty, deleteItem, updateCartMode, increaseMin, decreaseMin } from "../utils/itemActions";
import { exportItemsCSV, exportAdminCSV } from "../utils/exportUtils";
import ViewModeSelector from "./ViewModeSelector";
import InventoryAddForm from "./InventoryAddForm";
import InventoryEditForm from "./InventoryEditForm";
import InventoryRow from "./InventoryRow";
import InventoryCard from "./InventoryCard";

export default function InventoryTable({
  selectedHouse,
  onExportRequest,
  onAdminExportRequest,
}) {
  const PAGE_SIZE = 100;

  const { categories, subcategories } = useCategoryData();

  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const { items, totalItems } = useInventoryItems(
    selectedHouse,
    page,
    PAGE_SIZE,
    refreshKey
  );

  useEffect(() => {
    if (onExportRequest) {
      onExportRequest.current = () =>
        exportItemsCSV(items, categories, subcategories);
    }
  }, [items, categories, subcategories, onExportRequest]);

  useEffect(() => {
    if (onAdminExportRequest) {
      onAdminExportRequest.current = () => exportAdminCSV();
    }
  }, [onAdminExportRequest]);

  const [viewMode, setViewMode] = useState(() => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isMobile ? "card" : "table";
  });

  const emptyItem = {
    Item: "",
    categoryId: "",
    subcategoryId: "",
    quantity: "",
    Min_Stock: "0",
    Unit: "",
    storage_location: "",
    expiry_date: "",
    life: "Non-Perishable",
    stores: [],
  };

  const [newItem, setNewItem] = useState({ ...emptyItem });
  const [editItem, setEditItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const LIFE_OPTIONS = [
    "Short-Life",
    "Medium-Life",
    "Long-Life",
    "Non-Perishable",
  ];

  const { today, oneWeekFromNow } = getDateBounds();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("any");
  const [locationFilter, setLocationFilter] = useState("any");
  const [storeFilter, setStoreFilter] = useState("any");
  const [cartOnly, setCartOnly] = useState(false);

  const normalizeLocation = (s) => (s || "").trim().toLowerCase();
  // ------------------------------------------------------------
  // BASE FILTERS FOR DYNAMIC OPTIONS
  // ------------------------------------------------------------
  const baseFilteredForCategory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (items || []).filter((item) => {
      const name = (item.Item || "").toLowerCase();
      const catName = (categories[item.categoryId] || "").toLowerCase();
      const loc = (item.storage_location || "").toLowerCase();

      if (term) {
        const matches =
          name.includes(term) ||
          catName.includes(term) ||
          loc.includes(term);
        if (!matches) return false;
      }

      if (locationFilter !== "any") {
        const itemLoc = item.storage_location || "";
        if (!itemLoc) return false;
        if (normalizeLocation(itemLoc) !== normalizeLocation(locationFilter)) {
          return false;
        }
      }

      if (storeFilter !== "any") {
        const storeIds = item.stores || [];
        const normalized = storeIds.map((s) =>
          typeof s === "object" ? s.$id : s
        );
        if (!normalized.includes(storeFilter)) return false;
      }

      if (cartOnly) {
        const inCart =
          item.cart_mode === "manual" || item.cart_mode === "auto";
        if (!inCart) return false;
      }

      return true;
    });
  }, [
    items,
    categories,
    searchTerm,
    locationFilter,
    storeFilter,
    cartOnly,
  ]);

  const baseFilteredForLocation = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (items || []).filter((item) => {
      const name = (item.Item || "").toLowerCase();
      const catName = (categories[item.categoryId] || "").toLowerCase();
      const loc = (item.storage_location || "").toLowerCase();

      if (term) {
        const matches =
          name.includes(term) ||
          catName.includes(term) ||
          loc.includes(term);
        if (!matches) return false;
      }

      if (categoryFilter !== "any") {
        const itemCat = categories[item.categoryId] || "";
        if (itemCat !== categoryFilter) return false;
      }

      if (storeFilter !== "any") {
        const storeIds = item.stores || [];
        const normalized = storeIds.map((s) =>
          typeof s === "object" ? s.$id : s
        );
        if (!normalized.includes(storeFilter)) return false;
      }

      if (cartOnly) {
        const inCart =
          item.cart_mode === "manual" || item.cart_mode === "auto";
        if (!inCart) return false;
      }

      return true;
    });
  }, [
    items,
    categories,
    searchTerm,
    categoryFilter,
    storeFilter,
    cartOnly,
  ]);
  // Dynamic category options
  const categoryOptions = useMemo(() => {
    const names = new Set();
    baseFilteredForCategory.forEach((item) => {
      const name = categories[item.categoryId];
      if (name) names.add(name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [baseFilteredForCategory, categories]);

  // Dynamic location options
  const locationOptions = useMemo(() => {
    const locMap = new Map();
    baseFilteredForLocation.forEach((item) => {
      const raw = item.storage_location || "";
      const trimmed = raw.trim();
      if (!trimmed) return;
      const norm = normalizeLocation(trimmed);
      if (!locMap.has(norm)) {
        locMap.set(norm, trimmed);
      }
    });
    return Array.from(locMap.values()).sort((a, b) => a.localeCompare(b));
  }, [baseFilteredForLocation]);

  // Dynamic store options
  const storeOptions = useMemo(() => {
    const map = new Map();
    (items || []).forEach((item) => {
      const stores = item.stores || [];
      stores.forEach((s) => {
        if (typeof s === "object") {
          if (!map.has(s.$id)) map.set(s.$id, s.name || s.$id);
        } else if (typeof s === "string") {
          if (!map.has(s)) map.set(s, s);
        }
      });
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // ------------------------------------------------------------
  // SORTING + FINAL FILTER
  // ------------------------------------------------------------
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const filteredAndSortedItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = (items || []).filter((item) => {
      const name = (item.Item || "").toLowerCase();
      const catName = (categories[item.categoryId] || "").toLowerCase();
      const loc = (item.storage_location || "").toLowerCase();

      if (term) {
        const matches =
          name.includes(term) ||
          catName.includes(term) ||
          loc.includes(term);
        if (!matches) return false;
      }

      if (categoryFilter !== "any") {
        const itemCat = categories[item.categoryId] || "";
        if (itemCat !== categoryFilter) return false;
      }

      if (locationFilter !== "any") {
        const itemLoc = item.storage_location || "";
        if (!itemLoc) return false;
        if (normalizeLocation(itemLoc) !== normalizeLocation(locationFilter)) {
          return false;
        }
      }

      if (storeFilter !== "any") {
        const storeIds = item.stores || [];
        const normalized = storeIds.map((s) =>
          typeof s === "object" ? s.$id : s
        );
        if (!normalized.includes(storeFilter)) return false;
      }

      if (cartOnly) {
        const inCart =
          item.cart_mode === "manual" || item.cart_mode === "auto";
        if (!inCart) return false;
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      let aVal = "";
      let bVal = "";

      if (sortField === "name") {
        aVal = (a.Item || "").toLowerCase();
        bVal = (b.Item || "").toLowerCase();
      } else if (sortField === "category") {
        const aCat = categories[a.categoryId] || "";
        const bCat = categories[b.categoryId] || "";
        aVal = aCat.toLowerCase();
        bVal = bCat.toLowerCase();
      } else if (sortField === "location") {
        const aLoc = a.storage_location || "";
        const bLoc = b.storage_location || "";
        aVal = aLoc.toLowerCase();
        bVal = bLoc.toLowerCase();

        const aEmpty = aLoc.trim() === "";
        const bEmpty = bLoc.trim() === "";
        if (aEmpty && !bEmpty) return 1;
        if (!aEmpty && bEmpty) return -1;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [
    items,
    categories,
    searchTerm,
    categoryFilter,
    locationFilter,
    storeFilter,
    cartOnly,
    sortField,
    sortDirection,
  ]);
  // ------------------------------------------------------------
  // Scanner
  // ------------------------------------------------------------
  const [showScanner, setShowScanner] = useState(false);

  // ------------------------------------------------------------
  // DATE FORMAT
  // ------------------------------------------------------------
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString();
  };

  // ------------------------------------------------------------
  // OPEN EDIT MODAL
  // ------------------------------------------------------------
  const openEditModal = (item) => {
    setEditItem({ ...item, expiry_date: item.expiry_date || "" });
    setShowEditModal(true);
    setErrorMessage("");
  };

  // ------------------------------------------------------------
  // SORT HANDLERS
  // ------------------------------------------------------------
  const handleSortFieldChange = (e) => {
    setSortField(e.target.value);
  };

  const handleSortDirectionToggle = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // ------------------------------------------------------------
  // CLEAR FILTERS
  // ------------------------------------------------------------
  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("any");
    setLocationFilter("any");
    setStoreFilter("any");
    setCartOnly(false);
    setSortField("name");
    setSortDirection("asc");
    setPage(0);
  };
  
  useEffect(() => {
    setPage(0);
  }, [searchTerm, categoryFilter, locationFilter, storeFilter, cartOnly]);

  // ------------------------------------------------------------
  // NO HOUSE SELECTED
  // ------------------------------------------------------------
  if (!selectedHouse) {
    return (
      <div style={{ padding: "20px", color: "#eee" }}>
        <h3>Select a house to view inventory</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        background: "#121212",
        minHeight: "100vh",
        color: "#eee",
      }}
    >
      {/* TOP ROW */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "8px 16px",
            background: "#333",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          + Add Item
        </button>

        <div
          style={{
            flex: "1 1 auto",
            textAlign: "center",
            fontSize: "0.8rem",
            color: "#aaa",
          }}
        >
          {filteredAndSortedItems.length} of {totalItems} items
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>

      {/* FILTER + SORT BAR */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {/* Search + Clear */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search by name, category, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: "1 1 200px",
              minWidth: "0",
              padding: "8px",
              background: "#1e1e1e",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "6px",
              fontSize: "0.9rem",
            }}
          />

          <button
            onClick={clearFilters}
            style={{
              padding: "8px 12px",
              background: "#333",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Category + Location */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              flex: "1 1 140px",
              minWidth: "0",
              padding: "6px 8px",
              background: "#1e1e1e",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "6px",
              fontSize: "0.85rem",
            }}
          >
            <option value="any">All categories</option>
            {categoryOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{
              flex: "1 1 140px",
              minWidth: "0",
              padding: "6px 8px",
              background: "#1e1e1e",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "6px",
              fontSize: "0.85rem",
            }}
          >
            <option value="any">All locations</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* NEW ROW: Store + 🛒 In Cart Only */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
            background: "#1e1e1e",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #333",
          }}
        >
          <span
            style={{
              color: "#ccc",
              fontSize: "0.8rem",
              whiteSpace: "nowrap",
            }}
          >
            Store:
          </span>

          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            style={{
              background: "#333",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "0.85rem",
              flex: "0 1 160px",
            }}
          >
            <option value="any">All stores</option>
            {storeOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* 🛒 In Cart Only toggle */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: cartOnly ? "#2a4" : "#333",
              padding: "6px 12px",
              borderRadius: "20px",
              border: "1px solid #555",
              cursor: "pointer",
              color: "#fff",
              fontSize: "0.85rem",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={cartOnly}
              onChange={() => setCartOnly((v) => !v)}
              style={{ display: "none" }}
            />
            🛒 In Cart Only
          </label>
        </div>

        {/* SORT ROW (now simplified) */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
            background: "#1e1e1e",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #333",
          }}
        >
          <span
            style={{
              color: "#ccc",
              fontSize: "0.8rem",
              whiteSpace: "nowrap",
            }}
          >
            Sort by:
          </span>

          <select
            value={sortField}
            onChange={handleSortFieldChange}
            style={{
              background: "#333",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "0.85rem",
              flex: "0 1 140px",
            }}
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="location">Storage Location</option>
          </select>

          <button
            onClick={handleSortDirectionToggle}
            style={{
              background: "#333",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {sortDirection === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>
      {showScanner && (
        <ReceiptScanner onClose={() => setShowScanner(false)} />
      )}

      {/* ADD FORM */}
      {showAddModal && (
        <InventoryAddForm
          item={newItem}
          setItem={setNewItem}
          onClose={() => {
            setShowAddModal(false);
            setErrorMessage("");
          }}
          onCreated={() => {
            setShowAddModal(false);
            setNewItem({ ...emptyItem });
            setRefreshKey((k) => k + 1);
          }}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          selectedHouse={selectedHouse}
          LIFE_OPTIONS={LIFE_OPTIONS}
          categories={categories}
          subcategories={subcategories}
        />
      )}

      {/* EDIT FORM */}
      {showEditModal && editItem && (
        <InventoryEditForm
          item={editItem}
          setItem={setEditItem}
          onClose={() => {
            setShowEditModal(false);
            setEditItem(null);
            setErrorMessage("");
          }}
          onUpdated={() => {
            setShowEditModal(false);
            setEditItem(null);
            setRefreshKey((k) => k + 1);
          }}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          selectedHouse={selectedHouse}
          LIFE_OPTIONS={LIFE_OPTIONS}
          categories={categories}
          subcategories={subcategories}
        />
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #444",
              minWidth: "900px",
            }}
          >
            <thead>
              <tr>
                <th style={th}>Item</th>
                <th style={th}>Category</th>
                <th style={th}>Subcategory</th>
                <th style={th}>Life</th>
                <th style={th}>Qty</th>
                <th style={th}>Min</th>
                <th style={th}>Unit</th>
                <th style={th}>Location</th>
                <th style={th}>Expiry</th>
                <th style={th}>Cart</th>
                <th style={th}>Stores</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAndSortedItems.map((item) => {
                const status = getAlertStatus(item, today, oneWeekFromNow);
                return (
                  <InventoryRow
                    key={item.$id}
                    item={item}
                    categoryName={categories[item.categoryId]}
                    subcategoryName={subcategories[item.subcategoryId]?.name}
                    formatDate={formatDate}
                    getAlertBadge={() => getAlertBadge(status)}
                    getRowStyle={() => ({
                      background: "#121212",
                      color: "#eee",
                      fontWeight: status ? "bold" : "normal",
                    })}
                    onEdit={openEditModal}
                    onDelete={async (fresh) => {
                      const ok = await deleteItem(fresh.$id);
                      if (ok) setRefreshKey((k) => k + 1);
                    }}
                    onIncrease={async (fresh) => {
                      const ok = await increaseQty(fresh);
                      if (ok) setRefreshKey((k) => k + 1);
                    }}
                    onDecrease={async (fresh) => {
                      const ok = await decreaseQty(fresh);
                      if (ok) setRefreshKey((k) => k + 1);
                    }}
                    onCartModeChange={async (fresh, mode) => {
                      const ok = await updateCartMode(fresh.$id, mode);
                      if (ok) setRefreshKey((k) => k + 1);
                    }}
                    onIncreaseMin={async (fresh) => {
                      const ok = await increaseMin(fresh);
                      if (ok) setRefreshKey((k) => k + 1);
                    }}
                    onDecreaseMin={async (fresh) => {
                      const ok = await decreaseMin(fresh);
                      if (ok) setRefreshKey((k) => k + 1);
                    }}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

{/* CARD VIEW */}
{viewMode === "card" && (
  <div>
    {filteredAndSortedItems.map((item) => {
      const status = getAlertStatus(item, today, oneWeekFromNow);

      return (
        <InventoryCard
          key={item.$id}
          item={item}
          categoryName={categories[item.categoryId]}
          subcategoryName={subcategories[item.subcategoryId]?.name}
          formatDate={formatDate}
          getAlertBadge={() => getAlertBadge(status)}

          onCartModeChange={async (fresh, mode) => {
            const ok = await updateCartMode(fresh.$id, mode);
            if (ok) setRefreshKey((k) => k + 1);
          }}

          onEdit={openEditModal}

          onDelete={async (fresh) => {
            const ok = await deleteItem(fresh.$id);
            if (ok) setRefreshKey((k) => k + 1);
          }}
          onIncrease={async (fresh) => {
            const ok = await increaseQty(fresh);
            if (ok) setRefreshKey((k) => k + 1);
          }}
          onDecrease={async (fresh) => {
            const ok = await decreaseQty(fresh);
            if (ok) setRefreshKey((k) => k + 1);
          }}
                    onIncreaseMin={async (fresh) => {
            const ok = await increaseMin(fresh);
            if (ok) setRefreshKey((k) => k + 1);
          }}
          onDecreaseMin={async (fresh) => {
            const ok = await decreaseMin(fresh);
            if (ok) setRefreshKey((k) => k + 1);
          }}
        />
      );
    })}
  </div>
)}


      {/* PAGINATION */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{
            padding: "8px 12px",
            background: page === 0 ? "#333" : "#444",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "4px",
            cursor: page === 0 ? "not-allowed" : "pointer",
          }}
        >
          Previous
        </button>

        <span style={{ color: "#ccc", fontSize: "0.9rem" }}>
          Page {page + 1} of {Math.max(1, Math.ceil(totalItems / PAGE_SIZE))}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={(page + 1) * PAGE_SIZE >= totalItems}
          style={{
            padding: "8px 12px",
            background:
              (page + 1) * PAGE_SIZE >= totalItems ? "#333" : "#444",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "4px",
            cursor:
              (page + 1) * PAGE_SIZE >= totalItems
                ? "not-allowed"
                : "pointer",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

const th = {
  border: "1px solid #444",
  padding: "8px",
  background: "#222",
  color: "#ccc",
  textAlign: "left",
};
