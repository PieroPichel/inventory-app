// ------------------------------------------------------------
// alertUtils.js
// Handles alert status, alert badges, and item sorting
// ------------------------------------------------------------

// Helper: get today's date and one week ahead
export function getDateBounds() {
  const today = new Date();
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);
  return { today, oneWeekFromNow };
}

// ------------------------------------------------------------
// Determine alert status for an item
// ------------------------------------------------------------
export function getAlertStatus(item, today, oneWeekFromNow) {
  const quantity = Number(item.quantity);
  const minStock = Number(item.Min_Stock ?? 0);
  const expiry = item.expiry_date ? new Date(item.expiry_date) : null;

  if (!isNaN(quantity) && !isNaN(minStock) && quantity < minStock) return "low";
  if (expiry && expiry < today) return "expired";
  if (expiry && expiry >= today && expiry <= oneWeekFromNow) return "soon";

  return null;
}

// ------------------------------------------------------------
// Return a JSX badge for the alert status
// ------------------------------------------------------------
export function getAlertBadge(status) {
  if (status === "expired")
    return <span style={{ color: "#ff6666", fontWeight: "bold" }}>Expired</span>;

  if (status === "soon")
    return <span style={{ color: "#ffcc66", fontWeight: "bold" }}>Soon</span>;

  if (status === "low")
    return <span style={{ color: "#ffff66", fontWeight: "bold" }}>Low</span>;

  return null;
}

// ------------------------------------------------------------
// Sort items so alerts appear first
// ------------------------------------------------------------
export function sortItems(items, today, oneWeekFromNow) {
  return [...items].sort((a, b) => {
    const aAlert = getAlertStatus(a, today, oneWeekFromNow) ? 1 : 0;
    const bAlert = getAlertStatus(b, today, oneWeekFromNow) ? 1 : 0;
    return bAlert - aAlert;
  });
}
