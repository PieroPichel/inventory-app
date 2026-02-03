import { useState, useEffect } from "react";

import useCategoryData from "../utils/useCategoryData";
import useInventoryItems from "../utils/useInventoryItems";

import {
  getDateBounds,
  getAlertStatus,
  getAlertBadge,
  sortItems,
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
  // ITEMS + PAGINATION
  // ------------------------------------------------------------
  const [page, setPage] = useState(0);
  const { items, totalItems } = useInventoryItems(
    selectedHouse,
    page,
    PAGE_SIZE
  );

  // ------------------------------------------------------------
  // EXPORT CALLBACKS
  // ------------------------------------------------------------
  useEffect(() => {
    if (onExportRequest) {
      onExportRequest.current = () =>
        exportItemsCSV(items, categories, subcategories);
    }
  }, [items, categories, subcategories]);

  useEffect(() => {
    if (onAdminExportRequest) {
      onAdminExportRequest.current = () => exportAdminCSV();
    }
  }, []);

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
  // ALERT + SORTING
  // ------------------------------------------------------------
  const { today, oneWeekFromNow } = getDateBounds();
  const sortedItems = sortItems(items, today, oneWeekFromNow);

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
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ color: "#aaa" }}>
          Showing {items.length} of {totalItems} items (page {page + 1} of{" "}
          {Math.max(1, Math.ceil(totalItems / PAGE_SIZE))})
        </h3>

        <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {/* ADD BUTTON */}
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          padding: "10px 20px",
          marginBottom: "20px",
          background: "#333",
          color: "#fff",
          border: "1px solid #555",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        + Add Item
      </button>

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
            setPage(0);
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
              {sortedItems.map((item) => {
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
                    onDelete={async () => {
                      const ok = await deleteItem(item.$id);
                      if (ok) setPage((p) => p); // triggers reload via hook
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
          {sortedItems.map((item) => {
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
                onDelete={async () => {
                  const ok = await deleteItem(item.$id);
                  if (ok) setPage((p) => p);
                }}
                onIncrease={async () => {
                  const ok = await increaseQty(item);
                  if (ok) setPage((p) => p);
                }}
                onDecrease={async () => {
                  const ok = await decreaseQty(item);
                  if (ok) setPage((p) => p);
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

        <span style={{ color: "#ccc" }}>
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
