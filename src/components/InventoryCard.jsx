// components/InventoryCard.jsx

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
}) {
  return (
    <div style={card}>
      {/* Header row: Item name + Qty controls */}
      <div style={headerRow}>
        <div style={itemName}>
          {item.Item}
          <span style={{ marginLeft: 6 }}>{getAlertBadge(item)}</span>
        </div>

        <div style={qtyControls}>
          <button style={qtyBtn} onClick={() => onDecrease(item)}>-</button>

          <div style={qtyBox}>
            <strong>{item.quantity}</strong> {item.Unit}
          </div>

          <button style={qtyBtn} onClick={() => onIncrease(item)}>+</button>
        </div>
      </div>

      {/* Details */}
      <div style={infoRow}>
        <span style={label}>Category:</span> {categoryName || "—"}
      </div>

      <div style={infoRow}>
        <span style={label}>Subcategory:</span> {subcategoryName || "—"}
      </div>

      <div style={infoRow}>
        <span style={label}>Life:</span> {item.life}
      </div>

      <div style={infoRow}>
        <span style={label}>Min Stock:</span> {item.Min_Stock}
      </div>

      <div style={infoRow}>
        <span style={label}>Location:</span> {item.storage_location || "—"}
      </div>

      <div style={infoRow}>
        <span style={label}>Expiry:</span> {formatDate(item.expiry_date)}
      </div>

      {/* Buttons */}
      <div style={buttonRow}>
        <button onClick={() => onEdit(item)} style={editBtn}>Edit</button>
        <button onClick={() => onDelete(item.$id)} style={deleteBtn}>Delete</button>
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
};

const itemName = {
  fontSize: "1.1rem",
  fontWeight: "bold",
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

const buttonRow = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "12px",
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
