// contentLog.controller.js
import asyncHandler from "express-async-handler";
import ContentLog from "../models/contentLog.model.js";
import { getAll } from "../utils/handlerFactory.util.js"; // Sirf getAll import karo

/**
 * @desc    Log a piece of content user viewed
 * @route   POST /api/content-log
 * @access  Private
 */
// Yahaan hum factory use NAHI kar rahe
// Kyunki isme custom logic hai (duplicate check)
export const logContentView = asyncHandler(async (req, res) => {
  const { type, title, contentId, source } = req.body;
  const userId = req.user._id;

  if (!type || !title || !contentId) {
    res.status(400);
    throw new Error("Type, title, and contentId are required");
  }

  // Custom logic: Check for duplicates in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const existingLog = await ContentLog.findOne({
    user: userId,
    contentId: contentId,
    createdAt: { $gte: oneHourAgo },
  });

  if (existingLog) {
    return res
      .status(200)
      .json({ message: "Content already logged recently", log: existingLog });
  }

  const newLog = await ContentLog.create({
    user: userId,
    type,
    title,
    contentId,
    source,
  });

  res.status(201).json(newLog);
});

/**
 * @desc    Get user's content view history
 * @route   GET /api/content-log
 * @access  Private
 */
// Yahaan factory perfect hai
export const getContentHistory = getAll(ContentLog, "history");
