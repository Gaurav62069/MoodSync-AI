import mongoose from 'mongoose';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/.+\@.+\..+/, 'Please use a valid email address'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'owner'], // 3 Roles: Owner Sabse Upar
      default: 'user'
    },
    isBlocked: {
      type: Boolean,
      default: false // By default koi block nahi hoga
    },
    country: {
      type: String,
      default: 'IN', // Default India rakhte hain
      uppercase: true, // Hamesha capital (e.g., 'IN')
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    googleId: {
      type: String,
      default: null,
    },
    profilePicture: {
      type: String,
      default: 'default-avatar.png',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    
    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    points: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    moodLogStreak: {
      type: Number,
      default: 0,
    },
    lastMoodLogDate: {
      type: Date,
    },
    lastForecast: {
      mood: String,
      confidence: Number,
      date: Date,
    },
    
    fcmToken: {
      type: String,
      default: null,
    },
    spotifyConnected: {
      type: Boolean,
      default: false,
    },
    spotifyAccessToken: {
      type: String,
      default: null,
    },
    spotifyRefreshToken: {
      type: String,
      default: null,
    },
    spotifyTokenExpiresAt: {
      type: Date,
      default: null,
    },
    preferences: {
      movieGenres: {
        type: [String], // e.g. ["Action", "Sci-Fi", "Comedy"]
        default: []
      },
      musicGenres: {
        type: [String], // e.g. ["Pop", "Rock", "Indie"]
        default: []
      },
      language: {
        type: String,
        default: 'en' // Content language preference
      },
      newsCategories: {  // 👈 Add this
        type: [String], 
        default: [] 
    },
    bookGenres: { type: [String], default: [] },
    videoCategories: {
        type: [String], // e.g. ["Coding", "Gaming", "Cooking"]
        default: []
    },
    // Jokes
    jokeCategories: { 
        type: [String], // e.g., ["Programming", "Dark"]
        default: [] 
    },
    // Tasks
    taskPreferences: { 
        type: [String], // e.g., ["Outdoor", "Social", "Creative"]
        default: [] 
    },
    favoriteArtists: { type: [String], default: [] },
     // e.g. ["Arijit Singh", "Weeknd"]
      favoriteCreators: { type: [String], default: [] },
       // e.g. ["Tanmay Bhat", "Veritasium"]
      languages: { type: [String], default: ['Hindi', 'English'] },
    },
    
  },
  { timestamps: true }
);

// Methods

// Method to generate email verification token
UserSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return verificationToken;
};

// Method to generate password reset token
UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', UserSchema);
export default User;