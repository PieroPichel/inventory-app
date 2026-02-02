import SharedModal from "./SharedModal";
import { databases } from "../appwrite";
import CategorySelect from "./CategorySelect";
import SubcategorySelect from "./SubcategorySelect";

const DB_ID = "697dcef40009d64e2fe1";
const COLLECTION_ID = "inventory_items";

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

    return null;
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

      {/* ITEM NAME */}
      <div style={fullRow}>
        <label>Item *</label>
        <input
          type="text"
          value={item.Item}
          onChange={(e) => setItem({ ...item, Item: e.target.value })}
          style={input}
        />
      </div>

      {/* ROW 1 — Quantity, Min Stock, Unit */}
      <div style={row3}>
        <div style={col3}>
          <label>Quantity *</label>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => setItem({ ...item, quantity: e.target.value })}
            style={input}
          />
        </div>

        <div style={col3}>
          <label>Min Stock</label>
          <input
            type="number"
            value={item.Min_Stock}
            onChange={(e) => setItem({ ...item, Min_Stock: e.target.value })}
            style={input}
          />
        </div>

        <div style={col3}>
          <label>Unit *</label>
          <input
            type="text"
            value={item.Unit}
            onChange={(e) => setItem({ ...item, Unit: e.target.value })}
            style={input}
          />
        </div>
      </div>

      {/* ROW 2 — Category + Subcategory */}
      <div style={row}>
        <div style={col}>
          <label>Category *</label>
          <CategorySelect
            categories={categories}
            value={item.categoryId}
            onChange={(v) =>
              setItem({ ...item, categoryId: v, subcategoryId: "" })
            }
          />
        </div>

        <div style={col}>
          <label>Subcategory *</label>
          <SubcategorySelect
            subcategories={subcategories}
            categoryId={item.categoryId}
            value={item.subcategoryId}
            onChange={(v) => setItem({ ...item, subcategoryId: v })}
          />
        </div>
      </div>

      {/* ROW 3 — Life + Expiry Date */}
      <div style={row}>
        <div style={col}>
          <label>Life *</label>
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

        <div style={col}>
          <label>Expiry Date</label>
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

      {/* STORAGE LOCATION */}
      <div style={fullRow}>
        <label>Storage Location</label>
        <input
          type="text"
          value={item.storage_location}
          onChange={(e) =>
            setItem({ ...item, storage_location: e.target.value })
          }
          style={input}
        />
      </div>

      {/* NOTES */}
      <div style={fullRow}>
        <label>Notes</label>
        <textarea
          value={item.item_notes || ""}
          onChange={(e) =>
            setItem({ ...item, item_notes: e.target.value })
          }
          style={textarea}
        />
      </div>

      {/* SAVE BUTTON */}
      <button onClick={save} style={saveBtn}>
        Save
      </button>
    </SharedModal>
  );
}

/* ---------------------- STYLES ---------------------- */

const row = {
  display: "flex",
  gap: "10px",
  marginBottom: "12px",
  flexWrap: "wrap",
};

const col = {
  flex: "1 1 48%",
  minWidth: "140px",
};

const row3 = {
  display: "flex",
  gap: "10px",
  marginBottom: "12px",
  flexWrap: "wrap",
};

const col3 = {
  flex: "1 1 30%",
  minWidth: "100px",
};

const fullRow = {
  marginBottom: "12px",
};

const input = {
  width: "100%",
  padding: "8px",
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "4px",
};

const textarea = {
  width: "100%",
  padding: "8px",
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "4px",
  minHeight: "80px",
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
