import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback', // Yeh server.js ke relative hai
        proxy: true, // Trust proxy
      },
      async (accessToken, refreshToken, profile, done) => {
        // Yeh function Google login ke baad call hota hai
        try {
          // 1. Check karo ki user pehle se DB mein hai (Google ID se)
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Agar hai, toh use login kara do
            return done(null, user);
          }

          // 2. Check karo ki user email se register toh nahi kar chuka
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Agar email se hai, toh uski Google ID update kar do
            user.googleId = profile.id;
            user.profilePicture = profile.photos[0].value; // Google ki photo set kar do
            user.emailVerified = true; // Google se hai toh verified hi hai
            await user.save();
            return done(null, user);
          }

          // 3. Agar naya user hai, toh use create karo
          const newUser = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0].value,
            emailVerified: true, // Google se hai toh verified hi hai
            // Password ki zaroorat nahi hai
          });

          return done(null, newUser);
        } catch (error) {
          return done(error, false, { message: 'Authentication failed' });
        }
      }
    )
  );

  // Session ke liye user ko serialize/deserialize karna
  passport.serializeUser((user, done) => {
    done(null, user.id); // Sirf user ID ko session mein store karo
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user); // User object ko req.user mein attach karo
    } catch (error) {
      done(error, null);
    }
  });
};