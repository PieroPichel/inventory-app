export default function StockWishSwitch({ value, onChange }) {
  const mode = value || "stock";
  const isWish = mode === "wish";

  const base = {
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid #555",
    color: "#fff",
    fontSize: "0.85rem",
    userSelect: "none",
    cursor: "pointer",

    background: isWish ? "#2a4" : "#333",
    borderColor: isWish ? "#4f8" : "#666",
  };

  return (
    <div
      style={base}
      onClick={() => onChange(isWish ? "stock" : "wish")}
    >
      {isWish ? "💚 Wish List" : "📦 In Stock"}
    </div>
  );
}
