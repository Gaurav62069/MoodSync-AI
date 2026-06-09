import asyncHandler from 'express-async-handler';
import { 
  getUserProfileService, 
  updateUserProfileService, 
  deleteUserService, 
  registerPushTokenService 
} from '../services/user.service.js';

/**
 * @desc    Get user profile (Delegates to Service)
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfileService(req.user._id);

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    profilePicture: user.profilePicture,
    preferences: user.preferences,
    
    // Gamification & Stats
    points: user.points,
    badges: user.badges,
    moodLogStreak: user.moodLogStreak,
    
    // Integrations
    spotifyConnected: user.spotifyConnected,
  });
});

/**
 * @desc    Update user profile & preferences (Delegates to Service)
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  // Service call handles email logic, password hashing, and image upload
  const { user, message } = await updateUserProfileService(
    req.user._id, 
    req.body, 
    req.file
  );

  res.json({
    success: true,
    message: message,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      profilePicture: user.profilePicture,
      preferences: user.preferences,
    }
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/profile
 * @access  Private
 */
export const deleteUserProfile = asyncHandler(async (req, res) => {
  await deleteUserService(req.user._id);
  res.status(200).json({ success: true, message: 'User account deleted successfully' });
});

/**
 * @desc    Register FCM Push Token for Notifications
 * @route   POST /api/users/push-token
 * @access  Private
 */
export const registerPushToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    res.status(400);
    throw new Error('Device token is required');
  }

  await registerPushTokenService(req.user._id, token);
  
  res.status(200).json({ success: true, message: 'Push token registered successfully' });
});