import { useState, useEffect, useMemo } from "react";
import useCategoryData from "../utils/useCategoryData";
import useInventoryItems from "../utils/useInventoryItems";
import ReceiptScanner from "./ReceiptScanner";

import {
  getDateBounds,
  getAlertStatus,
  getAlertBadge,
} from "./alertUtils";

import {
  increaseQty,
  decreaseQty,
  deleteItem,
} from "../utils/itemActions";

import {
  exportItemsCSV,
  exportAdminCSV,
} from "../utils/exportUtils";

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

  // ------------------------------------------------------------
  // CATEGORY + SUBCATEGORY DATA
  // ------------------------------------------------------------
  const { categories, subcategories } = useCategoryData();

  // ------------------------------------------------------------
  // ITEMS + PAGINATION + REFRESH
  // ------------------------------------------------------------
  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const { items, totalItems } = useInventoryItems(
    selectedHouse,
    page,
    PAGE_SIZE,
    refreshKey
  );

  // ------------------------------------------------------------
  // EXPORT CALLBACKS
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // VIEW MODE
  // ------------------------------------------------------------
  const [viewMode, setViewMode] = useState(() => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );
    return isMobile ? "card" : "table";
  });

  // ------------------------------------------------------------
  // ADD / EDIT MODALS
  // ------------------------------------------------------------
  const emptyItem = {
    Item: "",
    categoryId: "",
    subcategoryId: "",
    quantity: "",
    Min_Stock: "0",
    Unit: "",
    storage_location: "",
    expiry_date: "",
    life: "Short-Life",
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

  // ------------------------------------------------------------
  // ALERT
  // ------------------------------------------------------------
  const { today, oneWeekFromNow } = getDateBounds();

  // ------------------------------------------------------------
  // SEARCH + FILTERS
  // ------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("any");
  const [locationFilter, setLocationFilter] = useState("any");

  const normalizeLocation = (s) => (s || "").trim().toLowerCase();

  // Base filter for computing dynamic options (search + other filter)
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
        if (
          normalizeLocation(itemLoc) !==
          normalizeLocation(locationFilter)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [items, categories, searchTerm, locationFilter]);

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

      return true;
    });
  }, [items, categories, searchTerm, categoryFilter]);

  // Dynamic category options based on current search + location filter
  const categoryOptions = useMemo(() => {
    const names = new Set();
    baseFilteredForCategory.forEach((item) => {
      const name = categories[item.categoryId];
      if (name) names.add(name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [baseFilteredForCategory, categories]);

  // Dynamic location options based on current search + category filter
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
    return Array.from(locMap.values()).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [baseFilteredForLocation]);

  // ------------------------------------------------------------
  // SORTING + FINAL FILTER
  // ------------------------------------------------------------
  const [sortField, setSortField] = useState("name"); // "name" | "category" | "location"
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" | "desc"

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
        if (
          normalizeLocation(itemLoc) !==
          normalizeLocation(locationFilter)
        ) {
          return false;
        }
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
        aVal = (aCat || "").toLowerCase();
        bVal = (bCat || "").toLowerCase();
      } else if (sortField === "location") {
        const aLoc = a.storage_location || "";
        const bLoc = b.storage_location || "";
        aVal = aLoc.toLowerCase();
        bVal = bLoc.toLowerCase();

        // Empty values last
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
      {/* TOP ROW: Add | count | view mode */}
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
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, category, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: "6px",
            fontSize: "0.9rem",
          }}
        />

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

        {/* Sort controls */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "center",
              background: "#1e1e1e",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #333",
              flex: "1 1 auto",
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
                flex: "1 1 auto",
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
              title={
                sortDirection === "asc"
                  ? "Ascending (click to switch to descending)"
                  : "Descending (click to switch to ascending)"
              }
            >
              {sortDirection === "asc" ? "↑" : "↓"}
            </button>
          </div>
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
            setRefreshKey((k) => k + 1); // reload after add
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
            setRefreshKey((k) => k + 1); // reload after edit
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
