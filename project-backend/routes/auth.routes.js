import express from 'express';
import passport from 'passport';
import {
  registerUser,
  loginUser,
  verifyEmailToken,
  forgotPassword,
  resetPassword,
  resendVerificationEmail
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import generateToken from '../utils/generateToken.util.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email/:token', verifyEmailToken);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);
router.post('/resend-verification', protect, resendVerificationEmail);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/google-auth-success?token=${token}`);
  }
);

export default router;