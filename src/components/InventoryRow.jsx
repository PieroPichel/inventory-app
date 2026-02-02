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
        <button onClick={() => onEdit(item)} style={editBtn}>
          Edit
        </button>

        <button onClick={() => onDelete(item.$id)} style={deleteBtn}>
          Delete
        </button>
      </td>
    </tr>
  );
}

/* ---------------------- STYLES ---------------------- */

const td = {
  border: "1px solid #333",
  padding: "8px",
};

const editBtn = {
  background: "#444",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "4px",
  cursor: "pointer",
  marginRight: "6px",
};

const deleteBtn = {
  background: "#b30000",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "4px",
  cursor: "pointer",
};
