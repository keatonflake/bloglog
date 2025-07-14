import { UserModel } from "../models/UserModel.js";

export const getUserProfile = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not Authenticated" });
  }

  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userProfile = await UserModel.findById(userId)
      .select("email username createdAt updatedAt")
      .lean();

    if (!userProfile) {
      return res.status(404).json({ error: "user not found" });
    }

    return res.status(200).json(userProfile);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUserProfile = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not Authenticated" });
  }

  try {
    const userId = req.user.id;

    const allowedUpdates = ["username", "email"];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUserProfile = await UserModel.findByIdAndUpdate(
      userId,
      updates,
      {
        new: true,
        runValidators: true,
      }
    )
      .select("username email createdAt updatedAt")
      .lean();

    if (!updatedUserProfile) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUserProfile,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.message,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `${field} is already taken`,
      });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
};
