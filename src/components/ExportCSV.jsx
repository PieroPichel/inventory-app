export default function ExportCSV({ items, categories, subcategories, currentUser }) {
  // Only allow your account to export
  if (!currentUser || currentUser.$id !== "697e5fe8ee0456829a68") {
    return null;
  }

  const exportCSV = () => {
    if (!items || items.length === 0) {
      alert("No items to export.");
      return;
    }

    const headers = [
      "Item",
      "Category",
      "Subcategory",
      "Life",
      "Quantity",
      "Min Stock",
      "Unit",
      "Location",
      "Expiry Date",
      "Item ID",
      "Category ID",
      "Subcategory ID",
      "House ID"
    ];

    const rows = items.map((item) => {
      const categoryName = categories[item.categoryId] || "";
      const subcatObj = subcategories[item.subcategoryId];
      const subcatName = subcatObj ? subcatObj.name : "";

      return [
        item.Item,
        categoryName,
        subcatName,
        item.life,
        item.quantity,
        item.Min_Stock,
        item.Unit,
        item.storage_location,
        item.expiry_date || "",
        item.$id,
        item.categoryId,
        item.subcategoryId,
        item.houseId
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory_export.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportCSV}
      style={{
        padding: "8px 14px",
        background: "#333",
        color: "white",
        border: "1px solid #555",
        borderRadius: "6px",
        cursor: "pointer",
        marginLeft: "10px"
      }}
    >
      Export CSV
    </button>
  );
}
