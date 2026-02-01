import { databases } from "../appwrite";

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
  CATEGORY_OPTIONS,
  LIFE_OPTIONS,
}) {
  const validate = (i) => {
    if (!i.Item.trim()) return "Item is required.";
    if (i.Item.length > 20) return "Item must be at most 20 characters.";
    if (i.stock_type && i.stock_type.length > 20)
      return "Stock type must be at most 20 characters.";
    if (!i.subcategory.trim()) return "Subcategory is required.";
    if (i.subcategory.length > 20)
      return "Subcategory must be at most 20 characters.";
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
      alert("Edit failed — check Appwrite schema/permissions.");
    }
  };

  return (
    <Modal
      title="Edit Item"
      item={item}
      setItem={setItem}
      onSave={save}
      onCancel={onClose}
      errorMessage={errorMessage}
      CATEGORY_OPTIONS={CATEGORY_OPTIONS}
      LIFE_OPTIONS={LIFE_OPTIONS}
    />
  );
}

/* ---------------------- SHARED MODAL ---------------------- */

function Modal({
  title,
  item,
  setItem,
  onSave,
  onCancel,
  errorMessage,
  CATEGORY_OPTIONS,
  LIFE_OPTIONS,
}) {
  return (
    <div style={overlay}>
      <div style={box}>
        <h3>{title}</h3>

        {errorMessage && <div style={errBox}>{errorMessage}</div>}

        {field("Item *", "text", item.Item, (v) => setItem({ ...item, Item: v }))}
        {field("Stock Type", "text", item.stock_type, (v) =>
          setItem({ ...item, stock_type: v })
        )}

        <label>Category *</label>
        <select
          value={item.Category}
          onChange={(e) => setItem({ ...item, Category: e.target.value })}
          style={input}
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {field("Subcategory *", "text", item.subcategory, (v) =>
          setItem({ ...item, subcategory: v })
        )}

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

        <button onClick={onSave} style={saveBtn}>Save</button>
        <button onClick={onCancel} style={cancelBtn}>Cancel</button>
      </div>
    </div>
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

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const box = {
  background: "#1e1e1e",
  padding: "20px",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "400px",
};

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

const cancelBtn = {
  padding: "10px",
  width: "100%",
  background: "#444",
  border: "none",
  color: "#fff",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "10px",
};

