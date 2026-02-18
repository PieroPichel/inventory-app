const selectStyle = {
  width: "100%",
  padding: "8px",
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "4px",
  marginBottom: "10px",
  opacity: 1,
};

export default function SubcategorySelect({
  subcategories,
  categoryId,
  value,
  onChange,
}) {
  // Convert object → array of { id, name, categoryId }
  const list = Object.entries(subcategories).map(([id, data]) => ({
    id,
    name: data.name,
    categoryId: data.categoryId,
  }));

  // Filter by selected category
  const filtered = categoryId
    ? list.filter((s) => s.categoryId === categoryId)
    : [];

  // CASE 1: No category selected → disabled dropdown
  if (!categoryId) {
    return (
      <select disabled style={{ ...selectStyle, opacity: 0.6 }}>
        <option>Select a category first</option>
      </select>
    );
  }

  // CASE 2: Category selected but no subcategories exist
  if (filtered.length === 0) {
    return (
      <select disabled style={{ ...selectStyle, opacity: 0.6 }}>
        <option>No subcategories available</option>
      </select>
    );
  }

  // CASE 3: Normal dropdown
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
