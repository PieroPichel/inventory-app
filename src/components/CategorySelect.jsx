import { useCategories } from "../hooks/useCategories";

export default function CategorySelect({ value, onChange }) {
  const { categories, loading } = useCategories();

  if (loading) return <p>Loading categories…</p>;

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select category</option>
      {categories.map((cat) => (
        <option key={cat.$id} value={cat.$id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}

