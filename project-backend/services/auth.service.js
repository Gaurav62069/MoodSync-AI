import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import sendEmail from "./sendEmail.service.js";
import generateToken from "../utils/generateToken.util.js";

// --- 1. REGISTER SERVICE ---
export const registerUserService = async ({
  username,
  email,
  password,
  country,
}) => {
  if (!username || !email || !password) {
    throw new Error("Please fill all fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User with this email already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    country: country || "IN",
  });

  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  const message = `
    Hi ${username},
    Thank you for registering! Please click the link below to verify your email address:
    \n\n${verificationURL}\n\n
    This link will expire in 10 minutes.
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Email Verification - MoodSync",
      message,
    });
    return { message: "Registration successful. Please check your email." };
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw new Error("Email could not be sent. Please try registering again.");
  }
};

// --- 2. LOGIN SERVICE ---
export const loginUserService = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }

  if (!user.emailVerified) {
    throw new Error("Email not verified. Please check your inbox.");
  }

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture,
    token: generateToken(user._id),
  };
};

// --- 3. VERIFY EMAIL SERVICE ---
export const verifyEmailService = async (token) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Token is invalid or has expired.");
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;
  await user.save();

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    token: generateToken(user._id),
  };
};

// --- 4. FORGOT PASSWORD SERVICE ---
export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `
    You requested a password reset. Please click this link: 
    \n\n${resetURL}\n\n
    This link will expire in 10 minutes.
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token - MoodSync",
      message,
    });
    return { message: "Password reset email sent." };
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error("Email could not be sent.");
  }
};

// --- 5. RESET PASSWORD SERVICE ---
export const resetPasswordService = async (token, newPassword) => {
  if (!newPassword) throw new Error("Password is required");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Token is invalid or has expired.");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    token: generateToken(user._id),
  };
};

// --- 6. RESEND VERIFICATION SERVICE ---
export const resendVerificationService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (user.emailVerified) throw new Error("Email is already verified.");

  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  const message = `
    New verification link: \n\n${verificationURL}\n\n
    Link expires in 10 minutes.
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Resend: Verify Your Email",
      message,
    });
    return { message: "Verification link resent!" };
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error("Email could not be sent.");
  }
};
