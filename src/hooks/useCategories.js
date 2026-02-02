import { useEffect, useState } from "react";
import { databases } from "../appwrite";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await databases.listDocuments(
          "inventory",
          "inventory_category"
        );
        setCategories(res.documents);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { categories, loading };
}

