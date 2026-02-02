import { useEffect, useState } from "react";
import { account, databases } from "../appwrite";
import { Query } from "appwrite";
import { APP_VERSION } from "../version";
import { RELEASE_NOTES } from "../releaseNotes";

const DB_ID = "697dcef40009d64e2fe1";
const HOUSES_COLLECTION = "houses";
const USER_HOUSES_COLLECTION = "user_houses";

export default function TopBar({ onHouseChange, onExport }) {
  const [houses, setHouses] = useState([]);
  const [currentHouse, setCurrentHouse] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    const loadHouses = async () => {
      try {
        const user = await account.get();
        setCurrentUser(user);

        const links = await databases.listDocuments(
          DB_ID,
          USER_HOUSES_COLLECTION,
          [Query.equal("userId", user.$id)]
        );

        if (links.total === 0) {
          setLoading(false);
          return;
        }

        const houseIds = links.documents.map((doc) => doc.houseId);

        const houseDocs = await Promise.all(
          houseIds.map((id) =>
            databases.getDocument(DB_ID, HOUSES_COLLECTION, id)
          )
        );

        setHouses(houseDocs);

        const saved = localStorage.getItem("currentHouseId");
        const defaultHouse =
          houseDocs.find((h) => h.$id === saved) || houseDocs[0];

        setCurrentHouse(defaultHouse);
        onHouseChange(defaultHouse.$id);
      } catch (err) {
        console.error("Failed to load houses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHouses();
  }, []);

  const changeHouse = (houseId) => {
    const selected = houses.find((h) => h.$id === houseId);
    setCurrentHouse(selected);
    localStorage.setItem("currentHouseId", houseId);
    onHouseChange(houseId);
  };

  const logout = async () => {
    await account.deleteSession("current");
    window.location.href = "/login";
  };

  return (
    <>
      {/* TOP BAR */}
      <div
        style={{
          width: "100%",
          height: "60px",
          background: "#1a1a1a",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          boxSizing: "border-box",
        }}
      >
        {/* Left: Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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

          <h2 style={{ margin: 0, fontSize: "20px" }}>Household Inventory</h2>
        </div>

        {/* Middle: House selector */}
        {loading ? (
          <span style={{ color: "#aaa" }}>Loading houses…</span>
        ) : houses.length > 0 ? (
          <select
            value={currentHouse?.$id || ""}
            onChange={(e) => changeHouse(e.target.value)}
            style={{
              background: "#222",
              color: "white",
              border: "1px solid #444",
              padding: "6px 10px",
              borderRadius: "6px",
            }}
          >
            {houses.map((h) => (
              <option key={h.$id} value={h.$id}>
                {h.name}
              </option>
            ))}
          </select>
        ) : (
          <span style={{ color: "#aaa" }}>No houses found</span>
        )}

        {/* Right: User + Version + Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {currentUser && (
            <div style={{ textAlign: "right", lineHeight: "1.2" }}>
              <div style={{ fontSize: "12px", color: "#bbb" }}>
                {currentUser.name || currentUser.email}
              </div>

              {/* Version acts as button */}
              <div
                onClick={() => setShowNotes(!showNotes)}
                style={{
                  fontSize: "11px",
                  color: "#888",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Version {APP_VERSION}
              </div>
            </div>
          )}

          <button
            onClick={logout}
            style={{
              background: "#e74c3c",
              border: "none",
              padding: "8px 14px",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Log out
          </button>
        </div>
      </div>
      
      {currentUser?.$id === "697e5fe8ee0456829a68" && (
  <div
    onClick={onExport}
    style={{
      fontSize: "12px",
      background: "#333",
      padding: "6px 10px",
      borderRadius: "6px",
      cursor: "pointer",
      border: "1px solid #555"
    }}
  >
    Export CSV
  </div>
)}


      {/* RELEASE NOTES DROPDOWN */}
      {showNotes && (
        <div
          style={{
            background: "#1f1f1f",
            color: "#eee",
            padding: "15px",
            borderBottom: "1px solid #333",
            fontSize: "14px",
          }}
        >
          <h4 style={{ marginTop: 0 }}>Recent Releases</h4>

          {RELEASE_NOTES.slice(0, 5).map((entry) => (
            <div key={entry.version} style={{ marginBottom: "12px" }}>
              <strong>{entry.version}</strong>{" "}
              <span style={{ color: "#aaa" }}>— {entry.date}</span>
              <ul style={{ margin: "6px 0 0 20px" }}>
                {entry.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
