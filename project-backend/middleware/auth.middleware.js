import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// 👇 YE MISSING THA - AB ADD KAR DIYA HAI
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Console mein Check kar ki Backend ko kya mil raha hai
    console.log(`🔒 SECURITY CHECK:`);
    console.log(`   👤 User Role in DB: '${req.user.role}'`);
    console.log(`   ✅ Allowed Roles:   [${roles.join(', ')}]`);

    if (!roles.includes(req.user.role)) {
      console.log(`   ❌ ACCESS DENIED! '${req.user.role}' is not in allowed list.`);
      res.status(403);
      throw new Error(`User role '${req.user.role}' is not authorized to access this route`);
    }

    console.log(`   🔓 ACCESS GRANTED.`);
    next();
  };
};