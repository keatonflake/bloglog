import express from "express";
// import { body } from "express-validator";
// import {  } from "../controllers/blogController

import { protect } from "../middleware/auth.js";

const router = express.Router();

// router.get("/blogs", protect, getUserBlogs);

export default router;
