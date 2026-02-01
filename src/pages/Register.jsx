import { useEffect, useState } from "react";
import { account, databases, ID } from "../appwrite";
import { useSearchParams } from "react-router-dom";
import { Query } from "appwrite";

const DB_ID = "697dcef40009d64e2fe1";
const INVITES_COLLECTION = "invites";
const USER_HOUSES_COLLECTION = "user_houses";

export default function Register() {
  const [params] = useSearchParams();
  const inviteFromURL = params.get("invite");

  const [inviteCode, setInviteCode] = useState(inviteFromURL || "");
  const [invite, setInvite] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ---------------------- LOAD INVITE ----------------------
  useEffect(() => {
    if (!inviteCode) {
      setLoadingInvite(false);
      return;
    }

    const loadInvite = async () => {
      setLoadingInvite(true);
      setInviteError("");

      try {
        const res = await databases.listDocuments(DB_ID, INVITES_COLLECTION, [
          Query.equal("token", inviteCode),
          Query.equal("used", false)
        ]);

        if (res.total === 0) {
          setInvite(null);
          setInviteError("Invalid or expired invite code.");
        } else {
          setInvite(res.documents[0]);
        }
      } catch (err) {
        console.error("Invite lookup failed:", err);
        setInviteError("Error validating invite.");
      }

      setLoadingInvite(false);
    };

    loadInvite();
  }, [inviteCode]);

  // ---------------------- REGISTER USER ----------------------
  const registerUser = async (e) => {
    e.preventDefault();

    if (!invite) {
      alert("Invite code is invalid.");
      return;
    }

    try {
      // 1. Create user
      const user = await account.create(ID.unique(), email, password, name);

      // 2. Log them in
      await account.createEmailSession(email, password);

      // 3. Assign user to house
      await databases.createDocument(
        DB_ID,
        USER_HOUSES_COLLECTION,
        ID.unique(),
        {
          userId: user.$id,
          houseId: invite.houseId,
          role: invite.role || "member"
        }
      );

      // 4. Mark invite as used
      await databases.updateDocument(
        DB_ID,
        INVITES_COLLECTION,
        invite.$id,
        { used: true }
      );

      // 5. Redirect
      window.location.href = "/";
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      alert("Registration failed: " + err.message);
    }
  };

  // ---------------------- UI ----------------------
  return (
    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Create Account</h1>

      {/* ---------------------- INVITE INPUT ---------------------- */}
      <div style={{ width: "280px", marginBottom: "20px" }}>
        <label style={{ color: "#ccc", fontSize: "14px" }}>
          Invitation Code
        </label>

        <input
          type="text"
          placeholder="Paste invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.trim())}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #444",
            background: "#222",
            color: "white",
            width: "100%",
            marginTop: "6px"
          }}
        />

        {loadingInvite && (
          <p style={{ color: "#aaa", marginTop: "8px" }}>Validating…</p>
        )}

        {inviteError && (
          <p style={{ color: "#ff6666", marginTop: "8px" }}>{inviteError}</p>
        )}

        {invite && (
          <p style={{ color: "#4caf50", marginTop: "8px" }}>
            Joining <strong>{invite.houseId}</strong> as{" "}
            <strong>{invite.role}</strong>
          </p>
        )}
      </div>

      {/* ---------------------- REGISTRATION FORM ---------------------- */}
      <form
        onSubmit={registerUser}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "280px",
          gap: "12px"
        }}
      >
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ ...inputStyle, width: "100%" }}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#aaa",
              fontSize: "12px"
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <button
          type="submit"
          disabled={!invite}
          style={{
            padding: "10px",
            borderRadius: "6px",
            background: invite ? "#4caf50" : "#333",
            border: "none",
            color: "white",
            cursor: invite ? "pointer" : "not-allowed",
            marginTop: "10px"
          }}
        >
          Create Account
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#222",
  color: "white"
};
