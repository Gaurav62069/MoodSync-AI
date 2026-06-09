import User from '../models/user.model.js';
import * as factory from '../utils/handlerFactory.util.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Get all users (Standardized Factory)
 * @route   GET /api/v1/admin/users
 */
export const getAllUsers = factory.getAll(User, 'users');

/**
 * @desc    Delete User with Owner Protection
 * @route   DELETE /api/v1/admin/users/:id
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    res.status(404);
    throw new Error('User nahi mila!');
  }

  // 1. Owner Protection: Koi bhi owner ko delete nahi kar sakta
  if (targetUser.role === 'owner') {
    res.status(403);
    throw new Error('Bhai, Owner ko delete karne ki koshish bhi mat karna!');
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
  });
});

/**
 * @desc    Update User Role (Promote/Demote/Admin-to-Admin)
 * @route   PATCH /api/v1/admin/users/:id
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const targetUser = await User.findById(req.params.id);
  const currentUser = req.user; // Request karne wala (Tu ya koi aur Admin)

  if (!targetUser) {
    res.status(404);
    throw new Error('User nahi mila!');
  }

  // 1. Owner Immunity: Owner ka role koi change nahi kar sakta (not even another owner)
  if (targetUser.role === 'owner') {
    res.status(403);
    throw new Error('Owner ka role immutable hai. Tu hamesha boss rahega!');
  }

  // 2. Admin Logic: Ek admin dusre admin ko manage kar sakta hai, 
  // lekin sirf Owner hi kisi ko "Owner" bana sakta hai.
  if (role === 'owner' && currentUser.role !== 'owner') {
    res.status(403);
    throw new Error('Sirf asli Owner hi naya Owner bana sakta hai!');
  }

  targetUser.role = role;
  await targetUser.save();

  res.status(200).json({
    status: 'success',
    data: targetUser,
  });
});

/**
 * @desc    Toggle Block/Unblock with Owner Protection
 * @route   PATCH /api/v1/admin/users/:id/toggle-block
 */
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    res.status(404);
    throw new Error('User nahi mila!');
  }

  // 1. Owner Protection: Owner ko koi block nahi kar sakta
  if (targetUser.role === 'owner') {
    res.status(403);
    throw new Error('Owner ko block karna namumkin hai!');
  }

  // 2. Self-Block Protection
  if (targetUser._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Apne aap ko block kyun kar rahe ho bhai?');
  }

  targetUser.isBlocked = !targetUser.isBlocked;
  await targetUser.save();

  res.status(200).json({
    status: 'success',
    message: `User ko successfully ${targetUser.isBlocked ? 'block' : 'unblock'} kar diya gaya hai`,
    data: { isBlocked: targetUser.isBlocked }
  });
});