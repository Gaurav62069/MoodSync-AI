import asyncHandler from 'express-async-handler';
import { 
  registerUserService, 
  loginUserService, 
  verifyEmailService,
  forgotPasswordService,
  resetPasswordService,
  resendVerificationService
} from '../services/auth.service.js';

// --- REGISTER ---
export const registerUser = asyncHandler(async (req, res) => {
  const result = await registerUserService(req.body);
  res.status(201).json({
    success: true,
    message: result.message
  });
});

// --- LOGIN ---
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await loginUserService(email, password);
  
  res.json({
    success: true,
    _id: data._id,
    username: data.username,
    email: data.email,
    role: data.role,
    profilePicture: data.profilePicture,
    token: data.token
  });
});

// --- VERIFY EMAIL ---
export const verifyEmailToken = asyncHandler(async (req, res) => {
  const data = await verifyEmailService(req.params.token);
  
  res.status(200).json({
    message: 'Email verified successfully. You are now logged in.',
    _id: data._id,
    username: data.username,
    email: data.email,
    profilePicture: data.profilePicture,
    token: data.token
  });
});

// --- FORGOT PASSWORD ---
export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await forgotPasswordService(req.body.email);
  res.status(200).json({ 
    success: true, 
    message: result.message 
  });
});

// --- RESET PASSWORD ---
export const resetPassword = asyncHandler(async (req, res) => {
  const data = await resetPasswordService(req.params.token, req.body.password);
  
  res.status(200).json({
    message: 'Password reset successful. You are now logged in.',
    _id: data._id,
    username: data.username,
    email: data.email,
    token: data.token
  });
});

// --- RESEND VERIFICATION ---
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  // req.user Auth Middleware se aa raha hai
  const result = await resendVerificationService(req.user._id);
  res.json({ message: result.message });
});