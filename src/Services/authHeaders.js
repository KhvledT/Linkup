// Centralized JWT handling shared by every service module.
//
// The Route-Posts API requires `Authorization: Bearer <token>`. If a malformed value is sent
// (e.g. `Bearer undefined`), the API answers `401 {"success":false,"message":"jwt malformed"}`.
//
// A garbage token can persist in localStorage for a long time: an earlier broken build stored
// `data.data.token` even when that was `undefined`, leaving the literal string "undefined"
// under the `token` key. AuthContext used to treat any truthy string as "logged in", and the
// services forwarded it verbatim. This module stops that at every layer:
//   - `isValidJwt`  -> only well-formed JWTs pass (3 dot-separated base64url segments)
//   - `getAuthHeaders` -> never sends a malformed token; removes it instead
//   - `clearStoredAuth` -> used by AuthContext/LoginPage on bad-token recovery

export const getStoredToken = () => localStorage.getItem("token");

export const isValidJwt = (token) =>
  typeof token === "string" &&
  token.split(".").length === 3 &&
  token.length > 20 &&
  /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);

export const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userID");
};

export const getAuthHeaders = () => {
  const token = getStoredToken();
  if (!isValidJwt(token)) {
    // Never forward a malformed token to the API. Clean it up so the app cannot stay
    // "logged in" with a dead credential (AuthContext also validates on startup).
    clearStoredAuth();
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};
