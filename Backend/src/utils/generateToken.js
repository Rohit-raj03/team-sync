import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/**
 * Generate Access Token
 * @param {string|object} user - User object or MongoDB _id
 * @param {string} [role] - User role
 * @returns {string} Signed JWT Access Token
 */
export const generateAccessToken = (user, role = "user") => {
  const userId =
    typeof user === "object" && user?._id
      ? user._id.toString()
      : user?.toString?.() || user;
  const userRole = typeof user === "object" && user?.role ? user.role : role;
  const userEmail = typeof user === "object" && user?.email ? user.email : undefined;

  const secret =
    config?.ACCESS_TOKEN_SECRET ||
    process.env.ACCESS_TOKEN_SECRET ||
    "teamsync_access_secret_key";

  const payload = {
    userId,
    id: userId,
    role: userRole,
    ...(userEmail && { email: userEmail }),
  };

  return jwt.sign(payload, secret, {
    expiresIn: config?.ACCESS_TOKEN_EXPIRES_IN || process.env.ACCESS_TOKEN_EXPIRES_IN || "7d",
  });
};

/**
 * Generate Refresh Token
 * @param {string|object} user - User object or MongoDB _id
 * @param {string} [role] - User role
 * @returns {string} Signed JWT Refresh Token
 */
export const generateRefreshToken = (user, role = "user") => {
  const userId =
    typeof user === "object" && user?._id
      ? user._id.toString()
      : user?.toString?.() || user;
  const userRole = typeof user === "object" && user?.role ? user.role : role;

  const secret =
    config?.REFRESH_TOKEN_SECRET ||
    process.env.REFRESH_TOKEN_SECRET ||
    "teamsync_refresh_secret_key";

  return jwt.sign(
    {
      userId,
      id: userId,
      role: userRole,
    },
    secret,
    {
      expiresIn: config?.REFRESH_TOKEN_EXPIRES_IN || process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );
};

/**
 * Generate both Access and Refresh Tokens
 * @param {string|object} user - User object or user ID
 * @param {string} [role] - User role
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export const generateAccessAndRefreshTokens = (user, role = "user") => {
  const accessToken = generateAccessToken(user, role);
  const refreshToken = generateRefreshToken(user, role);

  return { accessToken, refreshToken };
};

// Alias for convenience
export const generateTokens = generateAccessAndRefreshTokens;

/**
 * Backward compatibility helper for generateToken
 * Defaults to generating access token
 */
export const generateToken = generateAccessToken;

/**
 * Standard HTTP-only cookie configuration for Refresh Tokens
 */
export const getRefreshTokenCookieOptions = () => {
  const isProduction =
    config?.NODE_ENV === "production" || process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: "/",
  };
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  const secret =
    config?.ACCESS_TOKEN_SECRET ||
    process.env.ACCESS_TOKEN_SECRET ||
    "teamsync_access_secret_key";
  return jwt.verify(token, secret);
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  const secret =
    config?.REFRESH_TOKEN_SECRET ||
    process.env.REFRESH_TOKEN_SECRET ||
    "teamsync_refresh_secret_key";
  return jwt.verify(token, secret);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  generateAccessAndRefreshTokens,
  generateTokens,
  generateToken,
  getRefreshTokenCookieOptions,
  verifyAccessToken,
  verifyRefreshToken,
};

