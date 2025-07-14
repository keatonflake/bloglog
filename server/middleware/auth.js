import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";

const sendAuthError = (res, message, status = 401) => {
  res.status(status).json({ success: false, message });
};

const extractToken = (req) =>
  req.headers.authorization?.replace("Bearer ", "") || req.cookies?.jwt;

export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return sendAuthError(res, "Access Denied. No Token Provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return sendAuthError(res, "User no longer exists");
    }

    if (!user.isActive) {
      return sendAuthError(res, "User account is deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth Middleware error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return sendAuthError(res, "Invalid Token");
    }

    if (error instanceof jwt.TokenExpiredError) {
      return sendAuthError(res, "Token Expired");
    }

    return sendAuthError(res, "Server error during authentication", 500);
  }
};

// Optional auth middleware - doesn't fail if no token
// const optionalAuth = async (req, res, next) => {
//   try {
//     const token = extractToken(req);

//     if (!token) {
//       return next(); // Continue without user
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId);

//     if (user && user.isActive) {
//       req.user = user;
//     }

//     next();
//   } catch (error) {
//     // Log error but don't fail the request
//     console.log("Optional auth error:", error);
//     next();
//   }
// };

// Role-based protection
// const requireRole = (roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return sendAuthError(res, "Authentication required");
//     }

//     if (!roles.includes(req.user.role)) {
//       return sendAuthError(res, "Insufficient permissions", 403);
//     }

//     next();
//   };
// };
