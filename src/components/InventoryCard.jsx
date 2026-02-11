// components/InventoryCard.jsx

import CartButtonSwitch from "./CartButtonSwitch";

export default function InventoryCard({
  item,
  categoryName,
  subcategoryName,
  formatDate,
  getAlertBadge,
  onEdit,
  onDelete,
  onIncrease,
  onDecrease,
  onIncreaseMin,
  onDecreaseMin,
  onCartModeChange,
}) {
  // Normalize relation objects
  const stores = Array.isArray(item.stores)
    ? item.stores
        .map((s) => (typeof s === "object" ? s : null))
        .filter(Boolean)
    : [];

  const storePills =
    stores.length > 0 ? (
      <div style={storePillRow}>
        {stores.map((store) => (
          <span
            key={store.$id}
            style={{
              display: "inline-block",
              marginRight: "4px",
              marginBottom: "3px",
              padding: "2px 6px",
              borderRadius: "10px",
              background: "#333",
              color: store.colour || "#fff",
              fontSize: "0.75rem",
            }}
          >
            {store.icon ? `${store.icon} ` : ""}
            {store.name}
          </span>
        ))}
      </div>
    ) : (
      <span style={{ color: "#777", fontSize: "0.8rem" }}>—</span>
    );

  return (
    <div style={card}>
      {/* HEADER: NAME + QTY CONTROLS */}
      <div style={headerRow}>
        <div style={itemName}>
          {item.Item}
          <span style={{ marginLeft: 6 }}>{getAlertBadge(item)}</span>
        </div>

        <div style={qtyControls}>
          <button
            style={qtyBtn}
            onClick={() => onDecrease(item)}
            title="Decrease quantity"
          >
            -
          </button>

          <div style={qtyBox}>
            <strong>{item.quantity}</strong> {item.Unit}
          </div>

          <button
            style={qtyBtn}
            onClick={() => onIncrease(item)}
            title="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* INFO FIELDS */}
      <div style={infoRow}>
        <span style={label}>Category:</span> {categoryName || "—"}
      </div>

      <div style={infoRow}>
        <span style={label}>Subcategory:</span> {subcategoryName || "—"}
      </div>

      <div style={infoRow}>
        <span style={label}>Life:</span> {item.life}
      </div>

      {/* MIN STOCK WITH CONTROLS */}
      <div style={infoRow}>
        <span style={label}>Min Stock:</span>
        <div style={minControls}>
          <button
            style={minBtn}
            onClick={() => onDecreaseMin(item)}
            title="Decrease minimum stock"
          >
            -
          </button>

          <span style={minValue}>{item.Min_Stock}</span>

          <button
            style={minBtn}
            onClick={() => onIncreaseMin(item)}
            title="Increase minimum stock"
          >
            +
          </button>
        </div>
      </div>

      <div style={infoRow}>
        <span style={label}>Location:</span> {item.storage_location || "—"}
      </div>

      <div style={infoRow}>
        <span style={label}>Expiry:</span> {formatDate(item.expiry_date)}
      </div>

      {/* REMOVED CART TEXT ROW */}

      <div style={infoRow}>
        <span style={label}>Stores:</span>
        {storePills}
      </div>

      {/* BUTTONS + CART SWITCH */}
      <div style={buttonRow}>
        <CartButtonSwitch
          value={item.cart_mode}
          onChange={(mode) => onCartModeChange(item, mode)}
         />
          
        <button onClick={() => onEdit(item)} style={editBtn}>
          Edit
        </button>

        <button onClick={() => onDelete(item)} style={deleteBtn}>
          Delete
        </button>
        
      </div>
    </div>
  );
}

/* ---------------------- STYLES ---------------------- */

const card = {
  background: "#1b1b1b",
  border: "1px solid #333",
  borderRadius: "10px",
  padding: "15px",
  marginBottom: "15px",
  color: "#eee",
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
  gap: "8px",
};

const itemName = {
  fontSize: "1.05rem",
  fontWeight: "bold",
  flex: "1 1 auto",
};

const qtyControls = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const qtyBtn = {
  background: "#444",
  color: "#fff",
  border: "1px solid #666",
  width: "28px",
  height: "28px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "1rem",
  lineHeight: "1rem",
  textAlign: "center",
  padding: 0,
};

const qtyBox = {
  background: "#333",
  padding: "6px 10px",
  borderRadius: "6px",
  fontSize: "0.9rem",
  minWidth: "55px",
  textAlign: "center",
};

const infoRow = {
  marginBottom: "6px",
  fontSize: "0.9rem",
};

const label = {
  color: "#aaa",
  marginRight: "4px",
};

const storePillRow = {
  display: "inline-flex",
  flexWrap: "wrap",
  gap: "2px 4px",
  marginLeft: "4px",
};

const buttonRow = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "12px",
  alignItems: "center",
};

/* MIN CONTROLS */
const minControls = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  marginLeft: "4px",
};

const minBtn = {
  background: "#444",
  color: "#fff",
  border: "1px solid #666",
  width: "24px",
  height: "24px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.9rem",
  lineHeight: "0.9rem",
  textAlign: "center",
  padding: 0,
};

const minValue = {
  minWidth: "28px",
  textAlign: "center",
  fontSize: "0.9rem",
};

const editBtn = {
  background: "#444",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer",
};

const deleteBtn = {
  background: "#b30000",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer",
};
