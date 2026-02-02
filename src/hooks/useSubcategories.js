import { useEffect, useState } from "react";
import { databases, Query } from "../appwrite";

export function useSubcategories(categoryId) {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!categoryId) {
        setSubcategories([]);
        setLoading(false);
        return;
      }

      try {
        const res = await databases.listDocuments(
          "inventory",
          "inventory_subcategory",
          [Query.equal("categoryId", categoryId)]
        );
        setSubcategories(res.documents);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [categoryId]);

  return { subcategories, loading };
}

