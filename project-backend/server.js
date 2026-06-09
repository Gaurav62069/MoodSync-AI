import express from "express";
// Server entrypoint: sets up middleware, routes and scheduled jobs
import cors from "cors";
import session from "express-session";
import passport from "passport";
import cron from "node-cron";
import connectDB from "./config/db.config.js";
import { configurePassport } from "./config/passport.config.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import MongoStore from "connect-mongo";
// Import Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import suggestionRoutes from "./routes/suggestion.routes.js";
import contentLogRoutes from "./routes/contentLog.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import reportRoutes from "./routes/report.routes.js";
import taskRoutes from "./routes/task.routes.js";
import badgeRoutes from "./routes/badge.routes.js";
import sleepRoutes from "./routes/sleep.routes.js";
import activityLogRoutes from "./routes/activityLog.routes.js";
import spotifyRoutes from "./routes/spotify.routes.js";
import searchRoutes from "./routes/search.routes.js";
// Import Services (Cron jobs ke liye)
import { generateReportsForAllUsers } from "./services/reporting.service.js";
import { generateForecastsForAllUsers } from "./services/forecasting.service.js";
import adminRoutes from "./routes/admin.routes.js";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
connectDB();
configurePassport();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Frontend ka URL
    credentials: true, // Cookies/Sessions allow karne ke liye
  }),
);

// Parse incoming JSON bodies for all routes
app.use(express.json());

// Session and Passport middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      // 👈 2. यह ब्लॉक जोड़ें
      mongoUrl: process.env.MONGO_URI, // .env वाली सेम DB लिंक
      collectionName: "sessions", // DB में इस नाम का फोल्डर बनेगा
      ttl: 24 * 60 * 60, // सेशन 1 दिन तक रहेगा (Time to live)
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Production में true (HTTPS), Local में false
      maxAge: 24 * 60 * 60 * 1000, // 1 दिन (milliseconds में)
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Mount API routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/content-log", contentLogRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/activity", activityLogRoutes);
app.use("/api/spotify", spotifyRoutes);
app.use("/api/content", searchRoutes);
// Scheduled tasks (cron jobs)
cron.schedule("0 5 * * 0", () => {
  console.log("Running scheduled job: Generating weekly reports...");
  generateReportsForAllUsers();
});

cron.schedule("0 7 * * *", () => {
  console.log("Running scheduled job: Generating daily mood forecasts...");
  generateForecastsForAllUsers();
});
// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
