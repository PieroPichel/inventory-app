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
  // Support both object and array formats
  const list = Array.isArray(categories)
    ? categories.map((c) => ({ id: c.$id, name: c.name }))
    : Object.entries(categories).map(([id, name]) => ({
        id,
        name,
      }));

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectStyle}
    >
      <option value="">Select category</option>
      {list.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
