import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { UserModel } from "../models/UserModel.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id.toString());

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.cookie("jwt", token, cookieOptions);

  user.lastLogin = new Date();
  user.save({ validateBeforeSave: false });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
};

export const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: errors.array(),
      });
      return;
    }

    const { email, password, username } = req.body;

    const existingUser = await UserModel.findOne({
      $or: [
        { email: email.toLowerCase() },
        ...(username ? [{ username }] : []),
      ],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
        return;
      }
      if (existingUser.username === username) {
        res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
        return;
      }
    }

    const user = new UserModel({
      email: email.toLowerCase(),
      password: password,
      username: username.toLowerCase(),
    });

    await user.save();

    createSendToken(user, 201, res);
  } catch (error) {
    console.error("Register error", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        success: false,
        message: `${field} is already taken`,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;

    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    createSendToken(user, 200, res);
  } catch (error) {
    console.error("Login error: ", error);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Not Authenticated",
      });
      return;
    }

    const dbUser = await user.findById(user._id);

    if (!dbUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Get current user error: ", error);
    res.status;
  }
};

export const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error", error);
    res.status(500).json({
      success: false,
      message: "Server Error during Logout",
    });
  }
};
