// ------------------------------------------------------------
// exportUtils.js
// Centralized CSV + Admin Export logic
// ------------------------------------------------------------

import { databases, Query } from "../appwrite";

const DB_ID = "697dcef40009d64e2fe1";
const ITEMS_COLLECTION = "inventory_items";

// ------------------------------------------------------------
// CSV HELPER
// ------------------------------------------------------------
export function toCSV(headers, rows) {
  const headerLine = headers.join(",");
  const rowLines = rows.map((r) =>
    r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
  );
  return [headerLine, ...rowLines].join("\n");
}

// ------------------------------------------------------------
// DOWNLOAD HELPER
// ------------------------------------------------------------
export function downloadCSV(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

// ------------------------------------------------------------
// NORMAL EXPORT (selected house only)
// ------------------------------------------------------------
export function exportItemsCSV(items, categories, subcategories) {
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
    ];
  });

  const csv = toCSV(headers, rows);
  downloadCSV("inventory_export.csv", csv);
}

// ------------------------------------------------------------
// ADMIN EXPORT (full DB dump — WITHOUT USERS)
// ------------------------------------------------------------
export async function exportAdminCSV() {
  try {
    const housesRes = await databases.listDocuments(DB_ID, "houses", [Query.limit(500)]);
    const categoriesRes = await databases.listDocuments(DB_ID, "inventory_categories", [Query.limit(500)]);
    const subcategoriesRes = await databases.listDocuments(DB_ID, "inventory_subcategory", [Query.limit(1000)]);
    const itemsRes = await databases.listDocuments(DB_ID, ITEMS_COLLECTION, [Query.limit(1000)]);
    const userHousesRes = await databases.listDocuments(DB_ID, "user_houses", [Query.limit(500)]);

    // Build CSV sections
    const housesCSV = toCSV(
      ["House ID", "Name"],
      housesRes.documents.map((h) => [h.$id, h.name])
    );

    const categoriesCSV = toCSV(
      ["Category ID", "Name"],
      categoriesRes.documents.map((c) => [c.$id, c.name])
    );

    const subcategoriesCSV = toCSV(
      ["Subcategory ID", "Name", "Category ID"],
      subcategoriesRes.documents.map((s) => [s.$id, s.name, s.categoryId])
    );

    const itemsCSV = toCSV(
      [
        "Item",
        "Category ID",
        "Subcategory ID",
        "Life",
        "Quantity",
        "Min Stock",
        "Unit",
        "Location",
        "Expiry Date",
        "Item ID",
        "House ID"
      ],
      itemsRes.documents.map((i) => [
        i.Item,
        i.categoryId,
        i.subcategoryId,
        i.life,
        i.quantity,
        i.Min_Stock,
        i.Unit,
        i.storage_location,
        i.expiry_date || "",
        i.$id,
        i.houseId
      ])
    );

    const userHousesCSV = toCSV(
      ["Record ID", "User ID", "House ID"],
      userHousesRes.documents.map((uh) => [uh.$id, uh.userId, uh.houseId])
    );

    // Combine into one file (NO USERS SECTION)
    const finalCSV =
      "=== HOUSES ===\n" +
      housesCSV +
      "\n\n=== CATEGORIES ===\n" +
      categoriesCSV +
      "\n\n=== SUBCATEGORIES ===\n" +
      subcategoriesCSV +
      "\n\n=== ITEMS ===\n" +
      itemsCSV +
      "\n\n=== USER_HOUSES ===\n" +
      userHousesCSV;

    downloadCSV("admin_export_full_dump.csv", finalCSV);

  } catch (err) {
    console.error("Admin export failed:", err);
    alert("Admin export failed — check console.");
  }
}
