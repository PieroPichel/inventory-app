// ------------------------------------------------------------
// ViewModeSelector.jsx
// A small reusable component for switching between table/card view
// ------------------------------------------------------------

export default function ViewModeSelector({ viewMode, setViewMode }) {
  return (
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
  );
}
