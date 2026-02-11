import React from "react";

export default function CartButtonSwitch({ value, onChange }) {
  const cartMode = value || "none";

  const isManual = cartMode === "manual";
  const isAuto = cartMode === "auto";
  const isNone = !isManual && !isAuto;

  const handleClick = () => {
    if (isAuto) return; // locked
    if (isManual) onChange("none");
    else onChange("manual");
  };

  return (
    <div
      style={{
        padding: "6px 14px",
        borderRadius: "20px",
        border: "1px solid #555",
        color: "#fff",
        fontSize: "0.85rem",
        userSelect: "none",

        // NEW COLOR LOGIC
        background: isAuto
          ? "#5a4500" // amber-brown
          : isManual
          ? "#2a4"    // green
          : "#333",   // none

        borderColor: isAuto
          ? "#d4a017" // gold
          : isManual
          ? "#4f8"
          : "#666",

        opacity: isAuto ? 1 : 1, // Auto is no longer faded
        cursor: isAuto ? "not-allowed" : "pointer",
      }}
      onClick={handleClick}
    >
      {isManual && "🛒 Manual"}
      {isAuto && "🛒 Auto"}
      {isNone && "🛒 Not in cart"}
    </div>
  );
}
