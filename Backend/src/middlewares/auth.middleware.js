import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import config from "../config/config.js";

/**
 * Middleware: Verify JWT Access Token (Authentication)
 * Checks Authorization header Bearer token and fallback cookies.accessToken
 */
export const protect = async (req, res, next) => {
  let token = null;

  // 1. Check Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    // 2. Fallback to HTTP-only cookie if available
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a valid Bearer token.",
    });
  }

  try {
    const secret =
      config?.ACCESS_TOKEN_SECRET ||
      process.env.ACCESS_TOKEN_SECRET ||
      "teamsync_access_secret_key";

    const decoded = jwt.verify(token, secret);
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    // Attach user to request (excluding password and refreshToken)
    const user = await UserModel.findById(userId).select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session expired or user no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact an administrator.",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token has expired. Please refresh your token.",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Not authorized: Invalid access token.",
    });
  }
};

// Alias for protect
export const verifyToken = protect;

/**
 * Middleware: Authorize specific roles (Role-Based Access Control / RBAC)
 * @example authorizeRoles('admin')
 * @example authorizeRoles('admin', 'manager')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const normalizedAllowedRoles = roles.map((r) => r.toLowerCase().trim());
    const userRole = (req.user.role || "").toLowerCase().trim();

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Role '${req.user.role}' is not authorized to access this resource. Required: [${roles.join(", ")}]`,
      });
    }

    next();
  };
};

// Alias for authorizeRoles
export const requireRole = authorizeRoles;

/**
 * Middleware: Require Admin Role
 */
export const requireAdmin = authorizeRoles("admin");

/**
 * Middleware: Require Manager or Admin Role
 */
export const requireManagerOrAdmin = authorizeRoles("admin", "manager");

export default {
  protect,
  verifyToken,
  authorizeRoles,
  requireRole,
  requireAdmin,
  requireManagerOrAdmin,
};
