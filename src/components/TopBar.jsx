import { useEffect, useState } from "react";
import { account, databases } from "../appwrite";
import { Query } from "appwrite";
import { APP_VERSION } from "../version";
import { RELEASE_NOTES } from "../releaseNotes";

const DB_ID = "697dcef40009d64e2fe1";
const HOUSES_COLLECTION = "houses";
const USER_HOUSES_COLLECTION = "user_houses";

export default function TopBar({ onHouseChange, onExport, onAdminExport }) {
  const [houses, setHouses] = useState([]);
  const [currentHouse, setCurrentHouse] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // ------------------------------------------------------------
  // LOAD USER + HOUSES
  // ------------------------------------------------------------
  useEffect(() => {
    async function load() {
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
    }

    load();
  }, []);

  // ------------------------------------------------------------
  // CHANGE HOUSE
  // ------------------------------------------------------------
  const changeHouse = (houseId) => {
    const selected = houses.find((h) => h.$id === houseId);
    setCurrentHouse(selected);
    localStorage.setItem("currentHouseId", houseId);
    onHouseChange(houseId);
  };

  // ------------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------------
  const logout = async () => {
    await account.deleteSession("current");
    window.location.href = "/login";
  };

  // ------------------------------------------------------------
  // MENU ACTIONS
  // ------------------------------------------------------------
  const handleMenuAction = (fn) => {
    setShowMenu(false);
    fn && fn();
  };

  return (
    <>
      {/* TOP BAR */}
      <div style={topBar}>
        {/* ROW 1 — Logo + Version */}
        <div style={row1}>
          <div style={logoTitle}>
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

          <div onClick={() => setShowNotes(!showNotes)} style={version}>
            Version {APP_VERSION}
          </div>
        </div>

        {/* ROW 2 — House selector + User + Menu */}
        <div style={row2}>
          {/* House selector */}
          {loading ? (
            <span style={{ color: "#aaa", fontSize: "13px" }}>
              Loading houses…
            </span>
          ) : houses.length > 0 ? (
            <select
              value={currentHouse?.$id || ""}
              onChange={(e) => changeHouse(e.target.value)}
              style={houseSelect}
            >
              {houses.map((h) => (
                <option key={h.$id} value={h.$id}>
                  {h.name}
                </option>
              ))}
            </select>
          ) : (
            <span style={{ color: "#aaa", fontSize: "13px" }}>
              No houses found
            </span>
          )}

          {/* User label */}
          {currentUser && (
            <div style={userBox}>
              <span style={{ fontSize: "12px", color: "#bbb" }}>
                {currentUser.name || currentUser.email}
              </span>
            </div>
          )}

          {/* 3-dot menu */}
          <div style={menuWrapper}>
            <button style={menuButton} onClick={() => setShowMenu(!showMenu)}>
              ⋮
            </button>

            {showMenu && (
              <div style={menuDropdown}>
                {currentUser && (
                  <div style={menuHeader}>
                    Signed in as
                    <br />
                    <span style={{ fontWeight: "bold" }}>
                      {currentUser.name || currentUser.email}
                    </span>
                  </div>
                )}

                <button style={menuItem} onClick={() => handleMenuAction(onExport)}>
                  Export CSV
                </button>

                {currentUser?.$id === "697e5fe8ee0456829a68" && (
                  <button
                    style={menuItem}
                    onClick={() => handleMenuAction(onAdminExport)}
                  >
                    Admin Export
                  </button>
                )}

                <button style={menuItemDanger} onClick={() => handleMenuAction(logout)}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RELEASE NOTES */}
      {showNotes && (
        <div style={notesBox}>
          <h4 style={{ marginTop: 0 }}>Recent Releases</h4>

          {RELEASE_NOTES.slice(0, 7).map((entry) => (
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

/* ---------------------- STYLES ---------------------- */

const topBar = {
  width: "100%",
  background: "#1a1a1a",
  color: "white",
  padding: "10px 15px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const row1 = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const logoTitle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const version = {
  fontSize: "11px",
  color: "#888",
  cursor: "pointer",
  textDecoration: "underline",
};

const row2 = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
};

const houseSelect = {
  background: "#222",
  color: "white",
  border: "1px solid #444",
  padding: "6px 10px",
  borderRadius: "6px",
  fontSize: "13px",
};

const userBox = {
  flexGrow: 1,
  minWidth: "120px",
};

const menuWrapper = {
  position: "relative",
};

const menuButton = {
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "6px",
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: "16px",
  lineHeight: "1",
};

const menuDropdown = {
  position: "absolute",
  right: 0,
  top: "110%",
  background: "#222",
  border: "1px solid #444",
  borderRadius: "8px",
  padding: "8px 0",
  minWidth: "180px",
  zIndex: 1000,
  boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
};

const menuHeader = {
  padding: "6px 12px",
  fontSize: "11px",
  color: "#aaa",
  borderBottom: "1px solid #333",
};

const menuItem = {
  width: "100%",
  textAlign: "left",
  background: "transparent",
  border: "none",
  color: "#eee",
  padding: "8px 12px",
  fontSize: "13px",
  cursor: "pointer",
};

const menuItemDanger = {
  ...menuItem,
  color: "#ff6b6b",
};

const notesBox = {
  background: "#1f1f1f",
  color: "#eee",
  padding: "15px",
  borderBottom: "1px solid #333",
  fontSize: "14px",
};
