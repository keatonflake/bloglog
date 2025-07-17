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

    console.log("User recieved! :", user);

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

export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);

    if (user) {
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    console.log("Optional auth error:", error);
    req.user = null;
    next();
  }
};
