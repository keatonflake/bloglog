import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);

export default router;
