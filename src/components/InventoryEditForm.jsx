import SharedModal from "./SharedModal";
import { databases } from "../appwrite";
import CategorySelect from "./CategorySelect";
import SubcategorySelect from "./SubcategorySelect";
import { useEffect, useState } from "react";

const DB_ID = "697dcef40009d64e2fe1";
const COLLECTION_ID = "inventory_items";
const STORES_COLLECTION_ID = "stores";

export default function InventoryEditForm({
  item,
  setItem,
  onClose,
  onUpdated,
  errorMessage,
  setErrorMessage,
  selectedHouse,
  LIFE_OPTIONS,
  categories,
  subcategories,
}) {
  const [allStores, setAllStores] = useState([]);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  useEffect(() => {
    if (Array.isArray(item.stores)) {
      const ids = item.stores.map((s) => (typeof s === "object" ? s.$id : s));
      setItem({ ...item, stores: ids });
    }
  }, []);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const res = await databases.listDocuments(DB_ID, STORES_COLLECTION_ID);
        setAllStores(res.documents.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (e) {
        console.error("Failed to load stores:", e);
      }
    };
    loadStores();
  }, []);

  const validate = (i) => {
    if (!i.Item.trim()) return "Item is required.";
    if (i.Item.length > 20) return "Item must be at most 20 characters.";
    if (!i.categoryId) return "Category is required.";
    if (!i.subcategoryId) return "Subcategory is required.";
    if (isNaN(parseFloat(i.quantity))) return "Quantity must be a number.";
    if (parseFloat(i.quantity) < 0) return "Quantity cannot be negative.";
    if (i.Min_Stock && parseFloat(i.Min_Stock) < 0)
      return "Min Stock cannot be negative.";
    if (!i.Unit.trim()) return "Unit is required.";
    if (i.Unit.length > 10) return "Unit must be at most 10 characters.";
    if (!i.life.trim()) return "Life is required.";
    if (i.storage_location && i.storage_location.length > 20)
      return "Storage Location must be at most 20 characters.";
    return null;
  };

  const toggleStore = (storeId) => {
    const current = item.stores || [];
    setItem({
      ...item,
      stores: current.includes(storeId)
        ? current.filter((id) => id !== storeId)
        : [...current, storeId],
    });
  };

  const save = async () => {
    const err = validate(item);
    if (err) return setErrorMessage(err);

    const payload = {
      ...item,
      quantity: parseFloat(item.quantity),
      Min_Stock: item.Min_Stock ? parseFloat(item.Min_Stock) : 0,
      expiry_date: item.expiry_date || null,
      houseId: selectedHouse,
      stores: item.stores || [],
    };

    try {
      await databases.updateDocument(DB_ID, COLLECTION_ID, item.$id, payload);
      onUpdated();
    } catch (e) {
      console.error("Edit failed:", e);
      alert("Edit failed — check Appwrite permissions.");
    }
  };

  return (
    <SharedModal title="Edit Item" onCancel={onClose}>
      {errorMessage && <div style={errBox}>{errorMessage}</div>}

      {/* Two-column grid */}
      <div style={grid2}>

        <div style={field}>
          <label>Item *:</label>
          <input
            type="text"
            maxLength={20}
            value={item.Item}
            onChange={(e) => setItem({ ...item, Item: e.target.value })}
            style={input}
          />
        </div>

        <div style={field}>
          <label>Storage Location:</label>
          <input
            type="text"
            maxLength={20}
            value={item.storage_location}
            onChange={(e) =>
              setItem({ ...item, storage_location: e.target.value })
            }
            style={input}
          />
        </div>

      </div>

      {/* Three-column grid for Qty / Min / Unit */}
      <div style={grid3}>

        <div style={fieldSmall}>
          <label>Qty *:</label>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => setItem({ ...item, quantity: e.target.value })}
            style={input}
          />
        </div>

        <div style={fieldSmall}>
          <label>Min:</label>
          <input
            type="number"
            value={item.Min_Stock}
            onChange={(e) => setItem({ ...item, Min_Stock: e.target.value })}
            style={input}
          />
        </div>

        <div style={fieldSmall}>
          <label>Unit *:</label>
          <input
            type="text"
            value={item.Unit}
            onChange={(e) => setItem({ ...item, Unit: e.target.value })}
            style={input}
          />
        </div>

      </div>

      {/* Two-column grid */}
      <div style={grid2}>

        <div style={field}>
          <label>Category *:</label>
          <CategorySelect
            categories={categories}
            value={item.categoryId}
            onChange={(v) =>
              setItem({ ...item, categoryId: v, subcategoryId: "" })
            }
          />
        </div>

        <div style={field}>
          <label>Subcategory *:</label>
          <SubcategorySelect
            subcategories={subcategories}
            categoryId={item.categoryId}
            value={item.subcategoryId}
            onChange={(v) => setItem({ ...item, subcategoryId: v })}
          />
        </div>

        <div style={field}>
          <label>Life *:</label>
          <select
            value={item.life}
            onChange={(e) => setItem({ ...item, life: e.target.value })}
            style={input}
          >
            {LIFE_OPTIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <div style={field}>
          <label>Expiry:</label>
          <input
            type="date"
            value={item.expiry_date || ""}
            onChange={(e) =>
              setItem({ ...item, expiry_date: e.target.value })
            }
            style={input}
          />
        </div>

      </div>

      {/* Stores */}
      <div style={fullRow}>
        <label>Stores (ordered by preference):</label>

        <div
          style={tagBox}
          onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
        >
          {(item.stores || []).length === 0 && (
            <span style={{ color: "#888" }}>Select stores…</span>
          )}

          {(item.stores || []).map((id) => {
            const store = allStores.find((s) => s.$id === id);
            if (!store) return null;

            return (
              <span
                key={id}
                style={{
                  ...pill,
                  color: store.colour || "#fff",
                }}
              >
                {store.icon ? `${store.icon} ` : ""}
                {store.name}
              </span>
            );
          })}
        </div>

        {storeDropdownOpen && (
          <div style={dropdown}>
            {allStores.map((store) => {
              const selected = (item.stores || []).includes(store.$id);
              return (
                <div
                  key={store.$id}
                  style={{
                    padding: "6px 10px",
                    cursor: "pointer",
                    background: selected ? "#444" : "#222",
                    color: store.colour || "#fff",
                  }}
                  onClick={() => toggleStore(store.$id)}
                >
                  {store.icon ? `${store.icon} ` : ""}
                  {store.name}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div style={fullRow}>
        <label>Notes:</label>
        <textarea
          value={item.item_notes || ""}
          onChange={(e) =>
            setItem({ ...item, item_notes: e.target.value })
          }
          style={{ ...textarea, minHeight: "40px" }}
        />
      </div>

      <button onClick={save} style={saveBtn}>
        Save
      </button>
    </SharedModal>
  );
}

/* ---------------------- STYLES ---------------------- */

const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginBottom: "12px",
};

const grid3 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "12px",
  marginBottom: "12px",
};

const field = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  width: "90%",
};

const fieldSmall = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  width: "90%"
};

const fullRow = {
  marginBottom: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const input = {
  width: "100%",
  padding: "6px",
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "4px",
  fontSize: "0.9rem",
};

const textarea = {
  width: "100%",
  padding: "4px",
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "4px",
  fontSize: "0.9rem",
};

const tagBox = {
  width: "100%",
  minHeight: "38px",
  background: "#333",
  border: "1px solid #555",
  borderRadius: "4px",
  padding: "6px",
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  cursor: "pointer",
};

const pill = {
  background: "#222",
  padding: "6px 6px",
  borderRadius: "12px",
  fontSize: "0.9rem",
};

const dropdown = {
  background: "#222",
  border: "1px solid #555",
  borderRadius: "4px",
  marginTop: "4px",
  maxHeight: "150px",
  overflowY: "auto",
};

const errBox = {
  background: "#4a0000",
  color: "#ffb3b3",
  padding: "8px",
  borderRadius: "4px",
  marginBottom: "10px",
};

const saveBtn = {
  padding: "10px",
  width: "100%",
  background: "#4caf50",
  border: "none",
  color: "#fff",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "10px",
};
