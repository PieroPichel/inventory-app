import { useEffect, useState } from "react";
import { databases, account } from "../appwrite";
import { useNavigate } from "react-router-dom";
import { Query } from "appwrite";

const DB_ID = "697dcef40009d64e2fe1";
const HOUSES_COLLECTION = "houses";
const USER_HOUSES_COLLECTION = "user_houses";

export default function Manage() {
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const houseId = localStorage.getItem("currentHouseId");

  // ------------------------------------------------------------
  // LOAD HOUSE + CHECK ROLE
  // ------------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const user = await account.get();

        // 1. Check user role for this house
        const links = await databases.listDocuments(
          DB_ID,
          USER_HOUSES_COLLECTION,
          [
            Query.equal("userId", user.$id),
            Query.equal("houseId", houseId)
          ]
        );

        const link = links.documents[0];

        if (!link || link.role !== "owner") {
          // Not owner → redirect
          navigate("/");
          return;
        }

        // 2. Load house document
        const doc = await databases.getDocument(DB_ID, HOUSES_COLLECTION, houseId);
        setHouse(doc);
        setName(doc.name);
      } catch (err) {
        console.error("Failed to load manage page:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [houseId, navigate]);

  // ------------------------------------------------------------
  // SAVE CHANGES
  // ------------------------------------------------------------
  const save = async () => {
    if (!house) return;
    setSaving(true);

    try {
      await databases.updateDocument(DB_ID, HOUSES_COLLECTION, house.$id, {
        name,
      });

      alert("House name updated!");
      navigate("/");
    } catch (err) {
      console.error("Failed to update house:", err);
      alert("Error updating house");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 20, color: "#ccc" }}>Loading…</div>;
  }

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <div style={headerLeft}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 14L16 4L28 14"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="7"
              y="14"
              width="18"
              height="13"
              rx="2"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
            />
            <line
              x1="10"
              y1="18"
              x2="22"
              y2="18"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="10"
              y1="22"
              x2="22"
              y2="22"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <h2 style={{ margin: 0, fontSize: "20px" }}>Manage House</h2>
        </div>

        <button style={backButton} onClick={() => navigate("/")}>
          ← Back to Inventory
        </button>
      </div>

      {/* CONTENT */}
      <div style={content}>
        <h3 style={sectionTitle}>House Settings</h3>

        <label style={label}>House Name</label>
        <input
          value={name}
          maxLength={30}
          size={30}
          onChange={(e) => setName(e.target.value)}
          style={input}
        />
        
        { name.length > 28 && ( <div style={{ color: "#ff8888", fontSize: "12px", marginTop: "-15px", marginBottom: "10px" }}> Maximum 30 characters </div> )}

        <button style={saveButton} onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------- STYLES ---------------------- */

const page = {
  background: "#121212",
  minHeight: "100vh",
  color: "#eee",
  padding: "20px",
  boxSizing: "border-box",
  fontFamily: "sans-serif",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "25px",
};

const headerLeft = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const backButton = {
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "6px",
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: "13px",
};

const content = {
  background: "#1a1a1a",
  padding: "20px",
  borderRadius: "10px",
  border: "1px solid #333",
  maxWidth: "500px",
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: "15px",
  fontSize: "18px",
  color: "#fff",
};

const label = {
  display: "block",
  marginBottom: "6px",
  fontSize: "14px",
  color: "#bbb",
};

const input = {
  width: "240px",
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#222",
  color: "#fff",
  marginBottom: "20px",
  fontSize: "14px",
  display: "block",
};

const saveButton = {
  padding: "10px 16px",
  background: "#444",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};
