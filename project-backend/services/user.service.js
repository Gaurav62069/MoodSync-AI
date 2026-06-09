import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import sendEmail from './sendEmail.service.js';

// --- GET PROFILE ---
export const getUserProfileService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  return user;
};

// --- UPDATE PROFILE (The Heavy Lifter) ---
export const updateUserProfileService = async (userId, updateData, file) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  let emailChanged = false;
  let verificationToken = null;

  // A. Handle Preferences (Merge Logic)
  if (updateData.preferences) {
    user.preferences = {
      ...user.preferences, 
      ...updateData.preferences
    };
  }

  // B. Handle Email Update
  if (updateData.email) {
    const newEmail = updateData.email.trim();
    if (newEmail !== '' && newEmail !== user.email) {
      const userExists = await User.findOne({ email: newEmail });
      if (userExists) throw new Error('Email is already in use');
      
      user.email = newEmail;
      user.emailVerified = false; 
      emailChanged = true;
    }
  }

  // C. Handle Username
  if (updateData.username && updateData.username.trim() !== '') {
    user.username = updateData.username.trim();
  }

  // D. Handle Password
  if (updateData.password && updateData.password.trim() !== '') {
    if (updateData.password.length < 6) throw new Error('Password must be at least 6 characters');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(updateData.password, salt);
  }

  // E. Handle Image Upload
  if (file) {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const mimeType = file.mimetype;
    user.profilePicture = `data:${mimeType};base64,${b64}`;
  }

  // F. Save & Send Email if needed
  if (emailChanged) {
    try {
      verificationToken = user.createEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Verify New Email',
        message: `Verify your new email: \n\n${verificationURL}\n\nLink expires in 10 minutes.`,
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      // Fail softly (User update stays, email verify pending)
    }
  } else {
    await user.save();
  }

  return { 
    user, 
    message: emailChanged ? 'Email updated! Please verify.' : 'Profile updated successfully!' 
  };
};

// --- DELETE USER ---
export const deleteUserService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  await User.deleteOne({ _id: userId });
  return true;
};

// --- PUSH TOKEN ---
export const registerPushTokenService = async (userId, token) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  user.fcmToken = token;
  await user.save();
  return true;
};