const selectStyle = {
  width: "100%",
  padding: "8px",
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "4px",
  marginBottom: "10px",
};

export default function SubcategorySelect({
  subcategories,
  categoryId,
  value,
  onChange,
}) {
  if (!categoryId) {
    return <p>Select a category first</p>;
  }

  // Convert object → array of { id, name, categoryId }
  const list = Object.entries(subcategories).map(([id, data]) => ({
    id,
    name: data.name,
    categoryId: data.categoryId,
  }));

  // Filter by selected category
  const filtered = list.filter((s) => s.categoryId === categoryId);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectStyle}
    >
      <option value="">Select subcategory</option>
      {filtered.map((sub) => (
        <option key={sub.id} value={sub.id}>
          {sub.name}
        </option>
      ))}
    </select>
  );
}
