import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/UserController.js";
import { body } from "express-validator";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put(
  "/profile",
  protect,
  [
    body("username")
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage("Username must be between 3 and 20 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      ),

    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),

    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),

    body("currentPassword")
      .if(body("password").exists())
      .notEmpty()
      .withMessage("Current password is required when changing password"),
  ],
  updateUserProfile
);

export default router;
