import express from "express";
// import { body } from "express-validator";
import {
  createBlog,
  deleteBlog,
  getBlogById,
  getUserBlogs,
  updateBlog,
} from "../controllers/blogController.js";

import { protect, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getUserBlogs);
router.get("/:blogId", optionalAuth, getBlogById);
router.post("/", protect, createBlog);
router.put("/:blogId", protect, updateBlog);
router.delete("/:blogId", protect, deleteBlog);

export default router;
