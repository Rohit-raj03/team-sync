import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import config from "../config/config.js";

/**
 * Middleware: Verify Bearer JWT Access Token
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);

      // Attach user object to request (excluding password)
      const user = await UserModel.findById(decoded.userId).select("-password");

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
      return res.status(401).json({
        success: false,
        message: "Not authorized: Invalid or expired token.",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized: No token provided in headers.",
    });
  }
};

/**
 * Middleware: Require Admin Role
 */
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied: Administrator permissions required.",
    });
  }
};

/**
 * Middleware: Authorize specific roles (e.g. authorizeRoles('admin', 'manager'))
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Role '${req.user?.role || "unknown"}' is not authorized to access this route.`,
      });
    }
    next();
  };
};
