import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 5050,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET || "teamsync_access_token_secret_default",
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET || "teamsync_refresh_token_secret_default",
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
};

export default config;
