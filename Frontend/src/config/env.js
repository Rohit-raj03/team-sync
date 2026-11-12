const rawApiUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5050/api"
).trim();

// Strip trailing slashes
const cleanUrl = rawApiUrl.replace(/\/+$/, "");

// Ensure API base URL points to the /api endpoint matching AgentraTeam routes
const API_BASE_URL = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;

export const env = {
  API_BASE_URL,
  APP_NAME: (import.meta.env.VITE_APP_NAME || "AgentraTeam").trim(),
  GOOGLE_CLIENT_ID: (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim(),
};

export default env;
