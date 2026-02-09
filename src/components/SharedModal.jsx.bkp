export default function SharedModal({ title, children, onCancel }) {
  return (
    <div style={overlay}>
      <div style={box}>
        <h3>{title}</h3>

        {children}

        <button onClick={onCancel} style={cancelBtn}>Cancel</button>
      </div>
    </div>
  );
}

/* ---------------------- STYLES ---------------------- */

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const box = {
  background: "#1e1e1e",
  padding: "20px",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "400px",
};

const cancelBtn = {
  padding: "10px",
  width: "100%",
  background: "#444",
  border: "none",
  color: "#fff",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "10px",
};

