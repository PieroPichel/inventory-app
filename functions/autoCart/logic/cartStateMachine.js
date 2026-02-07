export function resolveCartMode({ qty, min, mode }) {
  // User intent always wins
  if (mode === "manual") return "manual";

  // Auto mode clears only when stock recovers
  if (mode === "auto") {
    return qty >= min ? "none" : "auto";
  }

  // None becomes auto only when stock drops
  if (mode === "none") {
    return qty < min ? "auto" : "none";
  }

  // Fallback (should never happen)
  return "none";
}
