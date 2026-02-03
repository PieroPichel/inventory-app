// ------------------------------------------------------------
// itemActions.js
// Centralized item modification helpers (increase, decrease, delete)
// ------------------------------------------------------------

import { databases } from "../appwrite";

const DB_ID = "697dcef40009d64e2fe1";
const COLLECTION_ID = "inventory_items";

// ------------------------------------------------------------
// Increase quantity by 1
// ------------------------------------------------------------
export async function increaseQty(item) {
  try {
    await databases.updateDocument(DB_ID, COLLECTION_ID, item.$id, {
      quantity: Number(item.quantity) + 1,
    });
    return true;
  } catch (err) {
    console.error("Increase failed:", err);
    return false;
  }
}

// ------------------------------------------------------------
// Decrease quantity by 1 (never below 0)
// ------------------------------------------------------------
export async function decreaseQty(item) {
  try {
    const newQty = Math.max(0, Number(item.quantity) - 1);
    await databases.updateDocument(DB_ID, COLLECTION_ID, item.$id, {
      quantity: newQty,
    });
    return true;
  } catch (err) {
    console.error("Decrease failed:", err);
    return false;
  }
}

// ------------------------------------------------------------
// Delete an item
// ------------------------------------------------------------
export async function deleteItem(id) {
  try {
    await databases.deleteDocument(DB_ID, COLLECTION_ID, id);
    return true;
  } catch (err) {
    console.error("Delete failed:", err);
    return false;
  }
}
