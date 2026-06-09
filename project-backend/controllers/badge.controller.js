import asyncHandler from 'express-async-handler';
import Badge from '../models/badge.model.js';

/**
 * @desc    Create a new badge
 * @route   POST /api/badges
 * @access  (Admin)
 */
export const createBadge = asyncHandler(async (req, res) => {
  const { badgeId, name, description, icon, type, value } = req.body;
  const badge = await Badge.create({
    badgeId, name, description, icon, type, value
  });
  res.status(201).json(badge);
});

/**
 * @desc    Get all badges
 * @route   GET /api/badges
 * @access  (User)
 */
export const getAllBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.find({});
  res.json(badges);
});