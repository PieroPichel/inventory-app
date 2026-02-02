import { useSubcategories } from "../hooks/useSubcategories";

export default function SubcategorySelect({ categoryId, value, onChange }) {
  const { subcategories, loading } = useSubcategories(categoryId);

  if (!categoryId) return <p>Select a category first</p>;
  if (loading) return <p>Loading subcategories…</p>;

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select subcategory</option>
      {subcategories.map((sub) => (
        <option key={sub.$id} value={sub.$id}>
          {sub.name}
        </option>
      ))}
    </select>
  );
}

