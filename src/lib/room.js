export { GRID_CONFIGS } from "./grid-configs";

/**
 * Generates a clean, readable Google Meet-style room code (e.g. "ere-nfuw-tqp")
 */
export function generateRoomId() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const segment = (len) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${segment(3)}-${segment(4)}-${segment(3)}`;
}

/**
 * Extracts and cleans a room ID from user input.
 * Handles both full URLs (e.g., "https://snapmate.app/room/ere-nfuw-tqp") and raw codes ("ere-nfuw-tqp").
 */
export function cleanRoomId(input) {
  if (!input) return "";
  const trimmed = input.trim().toLowerCase();
  if (trimmed.includes("/room/")) {
    const parts = trimmed.split("/room/");
    return parts[parts.length - 1].split("?")[0].split("#")[0].trim();
  }
  return trimmed.replace(/[^a-z0-9-]/g, "");
}

/**
 * Automatically formats pasted or raw room codes into Google Meet style: xxx-yyyy-zzz
 * E.g. "gcmftwbrzj" -> "gcm-ftwb-rzj"
 * Also handles room URLs gracefully.
 */
export function formatRoomCode(input) {
  if (!input) return "";
  let raw = input.trim().toLowerCase();
  if (raw.includes("/room/")) {
    const parts = raw.split("/room/");
    raw = parts[parts.length - 1].split("?")[0].split("#")[0].trim();
  } else if (raw.includes("/")) {
    const parts = raw.split("/");
    raw = parts[parts.length - 1].split("?")[0].split("#")[0].trim();
  }
  const lettersOnly = raw.replace(/[^a-z]/g, "");
  if (lettersOnly.length === 10) {
    return `${lettersOnly.slice(0, 3)}-${lettersOnly.slice(3, 7)}-${lettersOnly.slice(7, 10)}`;
  }
  return raw;
}

/**
 * Validates a room code according to the Snapmate room rules:
 * 1. Must contain ONLY alphabet characters and standard delimiters (-).
 * 2. Total alphabetic characters must be exactly 10.
 */
export function validateRoomCode(input) {
  if (!input) return { isValid: false, reason: "empty" };
  const trimmed = input.trim();

  // If there are symbols other than alphabet and hyphen, it is invalid
  const hasInvalidChars = /[^a-zA-Z-]/.test(trimmed);
  if (hasInvalidChars) {
    return { isValid: false, reason: "invalid_symbols" };
  }

  // Count alphabet letters
  const letters = trimmed.replace(/[^a-zA-Z]/g, "").toLowerCase();
  if (letters.length !== 10) {
    return { isValid: false, reason: "invalid_length", length: letters.length };
  }

  const formattedCode = `${letters.slice(0, 3)}-${letters.slice(3, 7)}-${letters.slice(7, 10)}`;
  return { isValid: true, formattedCode };
}

/**
 * Saves the curated photobooth session (layout + 4 selected photos) to sessionStorage.
 */
export function saveCuratedSession(roomId, layout, photos) {
  if (typeof window === "undefined") return;
  const data = {
    roomId,
    layout,
    photos,
    savedAt: new Date().toISOString(),
  };
  try {
    sessionStorage.setItem(`snapmate_session_${roomId}`, JSON.stringify(data));
    sessionStorage.setItem("snapmate_last_curated_session", JSON.stringify(data));
  } catch (err) {
    console.warn("Gagal menyimpan sesi ke sessionStorage:", err);
  }
}

/**
 * Retrieves the curated photobooth session from sessionStorage.
 */
export function getCuratedSession(roomId) {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(`snapmate_session_${roomId}`) ||
      sessionStorage.getItem("snapmate_last_curated_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

