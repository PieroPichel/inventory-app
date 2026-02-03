// ------------------------------------------------------------
// useCategoryData.js
// Loads categories + subcategories and returns them as maps
// ------------------------------------------------------------

import { useState, useEffect } from "react";
import { databases, Query } from "../appwrite";

const DB_ID = "697dcef40009d64e2fe1";

export default function useCategoryData() {
  const [categories, setCategories] = useState({});
  const [subcategories, setSubcategories] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const catRes = await databases.listDocuments(DB_ID, "inventory_categories");
        const subRes = await databases.listDocuments(DB_ID, "inventory_subcategory", [
          Query.limit(1000),
        ]);

        setCategories(
          Object.fromEntries(catRes.documents.map((c) => [c.$id, c.name]))
        );

        setSubcategories(
          Object.fromEntries(
            subRes.documents.map((s) => [
              s.$id,
              { name: s.name, categoryId: s.categoryId },
            ])
          )
        );
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    }

    load();
  }, []);

  return { categories, subcategories };
}
