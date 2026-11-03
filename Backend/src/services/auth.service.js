import UserModel from "../models/user.model.js";
import {
  generateAccessAndRefreshTokens,
  verifyRefreshToken,
} from "../utils/generateToken.js";
import { verifyGoogleToken } from "./google-auth.service.js";

/**
 * Register a new user with email and password
 */
export const register = async ({ name, email, password, role, jobTitle }) => {
  if (!name || !email || !password) {
    const error = new Error("Name, email, and password are required");
    error.statusCode = 400;
    throw error;
  }

  const cleanEmail = email.toLowerCase().trim();

  const existingUser = await UserModel.findOne({ email: cleanEmail });
  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  let userRole = "user";
  if (role) {
    const normalizedRole = role.toLowerCase().trim();
    const validRoles = ["admin", "user", "member", "manager"];
    if (validRoles.includes(normalizedRole)) {
      userRole = normalizedRole;
    }
  }

  const user = await UserModel.create({
    name: name.trim(),
    email: cleanEmail,
    password,
    role: userRole,
    jobTitle: jobTitle || (userRole === "admin" ? "Administrator" : "Team Member"),
  });

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
    user,
    user.role
  );

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

/**
 * Authenticate existing user with email and password
 */
export const login = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await UserModel.findOne({ email: cleanEmail });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.password && user.googleId) {
    const error = new Error("Account was created with Google. Please sign in with Google.");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Your account is deactivated. Please contact an administrator.");
    error.statusCode = 403;
    throw error;
  }

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
    user,
    user.role
  );

  user.refreshToken = refreshToken;
  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

/**
 * Authenticate or register user via verified Google ID Token
 */
export const loginWithGoogle = async (credential) => {
  const googleUser = await verifyGoogleToken(credential);

  // 1. Check if user already exists by Google ID
  let user = await UserModel.findOne({ googleId: googleUser.googleId });

  if (user) {
    if (!user.isActive) {
      const error = new Error("Your account is deactivated. Please contact an administrator.");
      error.statusCode = 403;
      throw error;
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
      user,
      user.role
    );

    user.refreshToken = refreshToken;
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    return { user, accessToken, refreshToken, isNewUser: false };
  }

  // 2. Check if user exists by verified email (Account Linking)
  user = await UserModel.findOne({ email: googleUser.email });

  if (user) {
    if (!user.isActive) {
      const error = new Error("Your account is deactivated. Please contact an administrator.");
      error.statusCode = 403;
      throw error;
    }

    // Link Google account without touching existing password
    user.googleId = googleUser.googleId;
    user.isEmailVerified = true;
    if (!user.avatar && googleUser.avatar) {
      user.avatar = googleUser.avatar;
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
      user,
      user.role
    );

    user.refreshToken = refreshToken;
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    return { user, accessToken, refreshToken, isNewUser: false };
  }

  // 3. New User Registration via Google
  user = await UserModel.create({
    name: googleUser.name,
    email: googleUser.email,
    googleId: googleUser.googleId,
    avatar: googleUser.avatar,
    isEmailVerified: true,
    role: "user",
    jobTitle: "Team Member",
  });

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
    user,
    user.role
  );

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken, isNewUser: true };
};

/**
 * Refresh access token using rotated refresh token
 */
export const refreshSession = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    const error = new Error("Invalid or expired refresh token");
    error.statusCode = 401;
    throw error;
  }

  const userId = decoded.userId || decoded.id;
  const user = await UserModel.findById(userId);

  if (!user || !user.isActive) {
    const error = new Error("Session expired or user inactive");
    error.statusCode = 401;
    throw error;
  }

  // Check token reuse
  if (user.refreshToken && user.refreshToken !== incomingRefreshToken) {
    user.refreshToken = "";
    await user.save({ validateBeforeSave: false });
    const error = new Error("Invalid or revoked refresh token. Please sign in again.");
    error.statusCode = 403;
    throw error;
  }

  // Rotate token
  const { accessToken, refreshToken: newRefreshToken } =
    generateAccessAndRefreshTokens(user, user.role);

  user.refreshToken = newRefreshToken;
  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken: newRefreshToken };
};

/**
 * Logout and invalidate session
 */
export const logout = async (userId) => {
  if (userId) {
    await UserModel.findByIdAndUpdate(userId, { refreshToken: "" });
  }
  return true;
};

export default {
  register,
  login,
  loginWithGoogle,
  refreshSession,
  logout,
};

