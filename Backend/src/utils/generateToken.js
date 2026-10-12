import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/**
 * Generate Access Token
 * @param {string} userId - User's MongoDB _id
 * @param {string} role - User's role (admin/user/member/manager)
 * @returns {string} Signed JWT Access Token
 */
export const generateAccessToken = (userId, role = 'user') => {
  const normalizedId = typeof userId === 'object' && userId?._id ? userId._id.toString() : userId?.toString?.() || userId;
  const secret =
    config?.ACCESS_TOKEN_SECRET ||
    process.env.ACCESS_TOKEN_SECRET ||
    process.env.JWT_SECRET ||
    'teamsync_access_secret_key';

  return jwt.sign(
    {
      userId: normalizedId,
      id: normalizedId,
      role,
    },
    secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    }
  );
};

/**
 * Generate Refresh Token
 * @param {string} userId - User's MongoDB _id
 * @param {string} role - User's role (admin/user/member/manager)
 * @returns {string} Signed JWT Refresh Token
 */
export const generateRefreshToken = (userId, role = 'user') => {
  const normalizedId = typeof userId === 'object' && userId?._id ? userId._id.toString() : userId?.toString?.() || userId;
  const secret =
    config?.REFRESH_TOKEN_SECRET ||
    process.env.REFRESH_TOKEN_SECRET ||
    'teamsync_refresh_secret_key';

  return jwt.sign(
    {
      userId: normalizedId,
      id: normalizedId,
      role,
    },
    secret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Generate both Access and Refresh Tokens
 * @param {string} userId - User's MongoDB _id
 * @param {string} role - User's role (admin/user/member/manager)
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export const generateAccessAndRefreshTokens = (userId, role = 'user') => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId, role);

  return { accessToken, refreshToken };
};

// Alias for convenience
export const generateTokens = generateAccessAndRefreshTokens;

/**
 * Backward compatibility helper for generateToken
 * Defaults to generating access token
 */
export const generateToken = generateAccessToken;

export default {
  generateAccessToken,
  generateRefreshToken,
  generateAccessAndRefreshTokens,
  generateTokens,
  generateToken,
};

