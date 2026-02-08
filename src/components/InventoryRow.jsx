// components/InventoryRow.jsx

export default function InventoryRow({
  item,
  categoryName,
  subcategoryName,
  formatDate,
  getAlertBadge,
  getRowStyle,
  onEdit,
  onDelete,
  onIncrease,
  onDecrease,
}) {
  return (
    <tr style={getRowStyle(item)}>
      <td style={td}>
        {item["Item"]} {getAlertBadge(item)}
      </td>

      {/* Dynamic category + subcategory */}
      <td style={td}>{categoryName || "—"}</td>
      <td style={td}>{subcategoryName || "—"}</td>

      <td style={td}>{item["life"]}</td>
      <td style={td}>{item["quantity"]}</td>
      <td style={td}>{item["Min_Stock"]}</td>
      <td style={td}>{item["Unit"]}</td>
      <td style={td}>{item["storage_location"]}</td>
      <td style={td}>{formatDate(item["expiry_date"])}</td>

      <td style={td}>
        <div style={actionContainer}>
          <div style={qtyGroup}>
            <button
              onClick={() => onDecrease(item)}
              style={qtyBtn}
              title="Decrease quantity"
            >
              -
            </button>
            <span style={qtyText}>{item.quantity}</span>
            <button
              onClick={() => onIncrease(item)}
              style={qtyBtn}
              title="Increase quantity"
            >
              +
            </button>
          </div>

          <div style={editDeleteGroup}>
            <button onClick={() => onEdit(item)} style={editBtn}>
              Edit
            </button>

            <button onClick={() => onDelete(item)} style={deleteBtn}>
              Delete
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ---------------------- STYLES ---------------------- */

const td = {
  border: "1px solid #333",
  padding: "8px",
  verticalAlign: "middle",
};

const actionContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const qtyGroup = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const qtyBtn = {
  background: "#444",
  color: "#fff",
  border: "none",
  padding: "4px 8px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.9rem",
};

const qtyText = {
  minWidth: "24px",
  textAlign: "center",
  fontSize: "0.9rem",
};

const editDeleteGroup = {
  display: "flex",
  gap: "6px",
  marginTop: "4px",
};

const editBtn = {
  background: "#444",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "4px",
  cursor: "pointer",
};

const deleteBtn = {
  background: "#b30000",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "4px",
  cursor: "pointer",
};
