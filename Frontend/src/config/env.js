export const env = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api",
  APP_NAME: import.meta.env.VITE_APP_NAME || "Team Sync",
};
