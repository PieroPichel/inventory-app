import { useState, useEffect } from "react";
import { databases, Query } from "../appwrite";

import InventoryAddForm from "./InventoryAddForm";
import InventoryEditForm from "./InventoryEditForm";
import InventoryRow from "./InventoryRow";
import InventoryCard from "./InventoryCard";

const DB_ID = "697dcef40009d64e2fe1";
const COLLECTION_ID = "inventory_items";

export default function InventoryTable({ selectedHouse, onExportRequest }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState({});
  const [subcategories, setSubcategories] = useState({});

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 100;
  const [totalItems, setTotalItems] = useState(0);

  const [viewMode, setViewMode] = useState("table");

  // ---------------------- EXPORT CSV ----------------------
  const handleExport = () => {
    if (!items.length) {
      alert("No items to export.");
      return;
    }

    const headers = [
      "Item",
      "Stock Type",
      "Category",
      "Subcategory",
      "Life",
      "Quantity",
      "Min Stock",
      "Unit",
      "Location",
      "Expiry Date",
      "Item ID",
      "Category ID",
      "Subcategory ID",
      "House ID"
    ];

    const rows = items.map((item) => {
      const categoryName = categories[item.categoryId] || "";
      const subcatObj = subcategories[item.subcategoryId];
      const subcatName = subcatObj ? subcatObj.name : "";

      return [
        item.Item,
        item.stock_type,
        categoryName,
        subcatName,
        item.life,
        item.quantity,
        item.Min_Stock,
        item.Unit,
        item.storage_location,
        item.expiry_date || "",
        item.$id,
        item.categoryId,
        item.subcategoryId,
        item.houseId
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory_export.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Wire export function to App.jsx
  useEffect(() => {
    if (onExportRequest) {
      onExportRequest.current = handleExport;
    }
  }, [items, categories, subcategories]);

  // ---------------------- EMPTY ITEM TEMPLATE ----------------------
  const emptyItem = {
    Item: "",
    stock_type: "",
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

  const LIFE_OPTIONS = [
    "Short-Life",
    "Medium-Life",
    "Long-Life",
    "Non-Perishable",
  ];

  // ---------------------- LOAD CATEGORIES + SUBCATEGORIES ----------------------
  const loadCategoryData = async () => {
    try {
      const catRes = await databases.listDocuments(DB_ID, "inventory_categories");
      const subRes = await databases.listDocuments(DB_ID, "inventory_subcategory");

      setCategories(
        Object.fromEntries(catRes.documents.map((c) => [c.$id, c.name]))
      );

      setSubcategories(
        Object.fromEntries(
          subRes.documents.map((s) => [
            s.$id,
            { name: s.name, categoryId: s.categoryId },
          ])
        )
      );
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    loadCategoryData();
  }, []);

  // ---------------------- LOAD ITEMS ----------------------
  const loadItems = () => {
    if (!selectedHouse) return;

    databases
      .listDocuments(DB_ID, COLLECTION_ID, [
        Query.equal("houseId", selectedHouse),
        Query.limit(PAGE_SIZE),
        Query.offset(page * PAGE_SIZE),
      ])
      .then((res) => {
        setItems(res.documents);
        setTotalItems(res.total);
      })
      .catch((err) => console.error("Error loading items:", err));
  };

  useEffect(() => {
    loadItems();
  }, [page, selectedHouse]);

  // ---------------------- DATE FORMAT ----------------------
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString();
  };

  // ---------------------- ALERT LOGIC ----------------------
  const today = new Date();
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);

  const getAlertStatus = (item) => {
    const quantity = Number(item.quantity);
    const minStock = Number(item.Min_Stock ?? 0);
    const expiry = item.expiry_date ? new Date(item.expiry_date) : null;

    if (!isNaN(quantity) && !isNaN(minStock) && quantity < minStock) return "low";
    if (expiry && expiry < today) return "expired";
    if (expiry && expiry >= today && expiry <= oneWeekFromNow) return "soon";
    return null;
  };

  const getAlertBadge = (item) => {
    const status = getAlertStatus(item);

    if (status === "expired")
      return <span style={{ color: "#ff6666", fontWeight: "bold" }}>Expired</span>;

    if (status === "soon")
      return <span style={{ color: "#ffcc66", fontWeight: "bold" }}>Soon</span>;

    if (status === "low")
      return <span style={{ color: "#ffff66", fontWeight: "bold" }}>Low</span>;

    return null;
  };

  const sortedItems = [...items].sort((a, b) => {
    const aAlert = getAlertStatus(a) ? 1 : 0;
    const bAlert = getAlertStatus(b) ? 1 : 0;
    return bAlert - aAlert;
  });

  // ---------------------- DELETE ITEM ----------------------
  const deleteItem = async (id) => {
    try {
      await databases.deleteDocument(DB_ID, COLLECTION_ID, id);
      loadItems();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed — check Appwrite permissions.");
    }
  };

  // ---------------------- OPEN EDIT MODAL ----------------------
  const openEditModal = (item) => {
    setEditItem({ ...item, expiry_date: item.expiry_date || "" });
    setShowEditModal(true);
    setErrorMessage("");
  };

  // ---------------------- NO HOUSE SELECTED ----------------------
  if (!selectedHouse) {
    return (
      <div style={{ padding: "20px", color: "#eee" }}>
        <h3>Select a house to view inventory</h3>
      </div>
    );
  }

  // ---------------------- MAIN RENDER ----------------------
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
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3 style={{ color: "#aaa" }}>
          Showing {items.length} of {totalItems} items (page {page + 1} of{" "}
          {Math.max(1, Math.ceil(totalItems / PAGE_SIZE))})
        </h3>

        {/* VIEW MODE SELECTOR */}
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          style={{
            padding: "8px",
            background: "#333",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "6px",
            cursor: "pointer",
            height: "40px",
          }}
        >
          <option value="table">Table View</option>
          <option value="card">Card View</option>
        </select>
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
            loadItems();
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
            loadItems();
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
                <th style={th}>Stock Type</th>
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
              {sortedItems.map((item) => (
                <InventoryRow
                  key={item.$id}
                  item={item}
                  categoryName={categories[item.categoryId]}
                  subcategoryName={subcategories[item.subcategoryId]?.name}
                  formatDate={formatDate}
                  getAlertBadge={getAlertBadge}
                  getRowStyle={(i) => ({
                    background: "#121212",
                    color: "#eee",
                    fontWeight: getAlertStatus(i) ? "bold" : "normal",
                  })}
                  onEdit={openEditModal}
                  onDelete={deleteItem}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CARD VIEW */}
      {viewMode === "card" && (
        <div>
          {sortedItems.map((item) => (
            <InventoryCard
              key={item.$id}
              item={item}
              categoryName={categories[item.categoryId]}
              subcategoryName={subcategories[item.subcategoryId]?.name}
              formatDate={formatDate}
              getAlertBadge={getAlertBadge}
              onEdit={openEditModal}
              onDelete={deleteItem}
            />
          ))}
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
