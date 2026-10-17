import crypto from "node:crypto";
import UserModel from "../models/user.model.js";
import config from "../config/config.js";
import {
  generateAccessAndRefreshTokens,
  getRefreshTokenCookieOptions,
  verifyRefreshToken,
} from "../utils/generateToken.js";

/**
 * @desc    Register a new user (with role: admin / user / member / manager)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, jobTitle } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Role validation: support 'admin', 'user', 'member', 'manager'
    let userRole = "user";
    if (role) {
      const normalizedRole = role.toLowerCase().trim();
      const validRoles = ["admin", "user", "member", "manager"];
      if (!validRoles.includes(normalizedRole)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Role must be 'admin' or 'user'",
        });
      }
      userRole = normalizedRole;
    }

    const user = await UserModel.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: userRole,
      jobTitle:
        jobTitle || (userRole === "admin" ? "Administrator" : "Team Member"),
    });

    // Generate both Access and Refresh Tokens
    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
      user,
      user.role,
    );

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set HTTP-only secure cookie for refresh token
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      token: accessToken, // for backward-compatibility
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        timezone: user.timezone,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

/**
 * @desc    Login user & get access + refresh tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact an administrator.",
      });
    }

    // Generate both Access and Refresh Tokens
    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
      user,
      user.role,
    );

    // Persist refresh token in database & record last activity
    user.refreshToken = refreshToken;
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    // Set HTTP-only secure cookie for refresh token
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      token: accessToken, // for backward-compatibility
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        timezone: user.timezone,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/**
 * @desc    Refresh Access Token using valid Refresh Token
 * @route   POST /api/auth/refresh-token or /api/auth/refresh
 * @access  Public (Requires valid refresh token in cookie or body)
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      req.headers["x-refresh-token"];

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Refresh token has expired. Please log in again.",
          code: "REFRESH_TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const userId = decoded.userId || decoded.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session expired or user no longer exists",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact an administrator.",
      });
    }

    // Security check: verify stored refreshToken matches
    if (user.refreshToken && user.refreshToken !== incomingRefreshToken) {
      // Possible token reuse attack or invalid session - invalidate token
      user.refreshToken = "";
      await user.save({ validateBeforeSave: false });
      res.clearCookie("refreshToken", getRefreshTokenCookieOptions());
      return res.status(403).json({
        success: false,
        message: "Invalid or revoked refresh token. Please sign in again.",
      });
    }

    // Token Rotation: Generate new pair of Access & Refresh Tokens
    const { accessToken, refreshToken: newRefreshToken } =
      generateAccessAndRefreshTokens(user, user.role);

    // Save rotated refresh token in database
    user.refreshToken = newRefreshToken;
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    // Set updated HTTP-only cookie
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken,
      token: accessToken,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error refreshing token",
    });
  }
};

/**
 * @desc    Logout user & invalidate refresh token
 * @route   POST /api/auth/logout
 * @access  Public / Private
 */
export const logoutUser = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    // Invalidate refresh token in database if user is identified
    if (req.user?._id) {
      await UserModel.findByIdAndUpdate(req.user._id, { refreshToken: "" });
    } else if (incomingRefreshToken) {
      try {
        const decoded = verifyRefreshToken(incomingRefreshToken);
        const userId = decoded.userId || decoded.id;
        if (userId) {
          await UserModel.findByIdAndUpdate(userId, { refreshToken: "" });
        }
      } catch (err) {
        // Token might already be expired; still proceed to clear cookie
      }
    }

    // Clear HTTP-only cookie
    res.clearCookie("refreshToken", getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

/**
 * @desc    Get currently logged in user session
 * @route   GET /api/auth/me
 * @access  Private (Bearer token)
 */
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select(
      "-password -refreshToken",
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetMe error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching user profile",
    });
  }
};

/**
 * @desc    Forgot Password - Request reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */

const RESET_SUCCESS_MESSAGE =
  "If that email exists in our system, we've sent a password reset link.";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body ?? {};

    // Validate the input type before calling string methods.
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Basic email format validation.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (cleanEmail.length > 254 || !emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await UserModel.findOne({ email: cleanEmail });

    // Do not disclose whether an account exists.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: RESET_SUCCESS_MESSAGE,
      });
    }

    // Generate a cryptographically secure, single-use token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA-256 hash in MongoDB.
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiresAt;

    await user.save({ validateBeforeSave: false });

    const clientUrl = config.CLIENT_URL || "http://localhost:5173";

    // Validate the URL before constructing the reset link.
    const parsedClientUrl = new URL(clientUrl);

    const isLocalhost =
      parsedClientUrl.hostname === "localhost" ||
      parsedClientUrl.hostname === "127.0.0.1";

    if (
      parsedClientUrl.protocol !== "https:" &&
      !(
        config.NODE_ENV !== "production" &&
        isLocalhost &&
        parsedClientUrl.protocol === "http:"
      )
    ) {
      throw new Error("CLIENT_URL must use HTTPS in production");
    }

    const resetUrl = new URL("/reset-password", parsedClientUrl);
    resetUrl.searchParams.set("token", resetToken);

    // TODO: Send resetUrl using your email service.
    // Example: await sendPasswordResetEmail(user.email, resetUrl.href);
    //
    // Never log resetToken or resetUrl in production.

    return res.status(200).json({
      success: true,
      message: RESET_SUCCESS_MESSAGE,

      // Local development convenience only.
      ...(config.NODE_ENV !== "production" && {
        resetUrl: resetUrl.href,
        resetToken,
      }),
    });
  } catch (error) {
    // Avoid logging reset tokens, URLs, or other sensitive data.
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error processing password reset request",
    });
  }
};

/**
 * @desc    Reset Password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash the token received to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid matching unexpired token
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset link is invalid or has expired",
      });
    }

    // Update password (pre-save hook will hash it automatically)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been successfully reset. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({
      message: "Server error resetting password",
    });
  }
};
