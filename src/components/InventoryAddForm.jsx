import SharedModal from "./SharedModal";
import { databases, ID } from "../appwrite";
import CategorySelect from "./CategorySelect";
import SubcategorySelect from "./SubcategorySelect";

const DB_ID = "697dcef40009d64e2fe1";
const COLLECTION_ID = "inventory_items";

export default function InventoryAddForm({
  item,
  setItem,
  onClose,
  onCreated,
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
    if (i.stock_type && i.stock_type.length > 20)
      return "Stock type must be at most 20 characters.";

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
      await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), payload);
      onCreated();
    } catch (e) {
      console.error("Add failed:", e);
      alert("Add failed — check Appwrite permissions.");
    }
  };

  return (
    <SharedModal title="Add New Item" onCancel={onClose}>
      {errorMessage && <div style={errBox}>{errorMessage}</div>}

      {field("Item *", "text", item.Item, (v) => setItem({ ...item, Item: v }))}
      {field("Stock Type", "text", item.stock_type, (v) =>
        setItem({ ...item, stock_type: v })
      )}

<div style={{ marginBottom: "10px" }}>
  <label>Category *</label>
  <CategorySelect
    categories={categories}
    value={item.categoryId}
    onChange={(v) =>
      setItem({ ...item, categoryId: v, subcategoryId: "" })
    }
  />
</div>

<div style={{ marginBottom: "10px" }}>
  <label>Subcategory *</label>
  <SubcategorySelect
    subcategories={subcategories}
    categoryId={item.categoryId}
    value={item.subcategoryId}
    onChange={(v) => setItem({ ...item, subcategoryId: v })}
  />
</div>


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

      {field("Quantity *", "number", item.quantity, (v) =>
        setItem({ ...item, quantity: v })
      )}

      {field("Min Stock", "number", item.Min_Stock, (v) =>
        setItem({ ...item, Min_Stock: v })
      )}

      {field("Unit *", "text", item.Unit, (v) =>
        setItem({ ...item, Unit: v })
      )}

      {field("Storage Location", "text", item.storage_location, (v) =>
        setItem({ ...item, storage_location: v })
      )}

      <label>Expiry Date</label>
      <input
        type="date"
        value={item.expiry_date || ""}
        onChange={(e) =>
          setItem({ ...item, expiry_date: e.target.value })
        }
        style={input}
      />

      <button onClick={save} style={saveBtn}>Save</button>
    </SharedModal>
  );
}

/* ---------------------- HELPERS ---------------------- */

const field = (label, type, value, onChange) => (
  <>
    <label>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={input}
    />
  </>
);

/* ---------------------- STYLES ---------------------- */

const input = {
  width: "100%",
  padding: "8px",
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "4px",
  marginBottom: "10px",
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
