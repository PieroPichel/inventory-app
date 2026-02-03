// ------------------------------------------------------------
// useInventoryItems.js
// Loads inventory items for a selected house with pagination
// ------------------------------------------------------------

import { useState, useEffect } from "react";
import { databases, Query } from "../appwrite";

const DB_ID = "697dcef40009d64e2fe1";
const COLLECTION_ID = "inventory_items";

export default function useInventoryItems(selectedHouse, page, pageSize) {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!selectedHouse) {
      setItems([]);
      setTotalItems(0);
      return;
    }

    databases
      .listDocuments(DB_ID, COLLECTION_ID, [
        Query.equal("houseId", selectedHouse),
        Query.limit(pageSize),
        Query.offset(page * pageSize),
      ])
      .then((res) => {
        setItems(res.documents);
        setTotalItems(res.total);
      })
      .catch((err) => console.error("Error loading items:", err));
  }, [selectedHouse, page, pageSize]);

  return { items, totalItems };
}
