const selectStyle = {
  width: "100%",
  padding: "8px",
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "4px",
  marginBottom: "10px",
};

export default function CategorySelect({ categories, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectStyle}
    >
      <option value="">Select category</option>
      {Object.entries(categories).map(([id, name]) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  );
}
