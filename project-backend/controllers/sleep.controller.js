import asyncHandler from 'express-async-handler';
import SleepLog from '../models/sleepLog.model.js';
import { getAll } from '../utils/handlerFactory.util.js';
import { analyzeSleepData } from '../services/ai.service.js';

/**
 * @desc    Log a new sleep entry (Supports both Web Manual & Mobile AI)
 * @route   POST /api/sleep
 * @access  Private
 */
export const logSleep = asyncHandler(async (req, res) => {
  const { 
    sleepStartTime, 
    sleepEndTime, 
    accelerometerData, 
    screenData,
    source = 'web' // Default to 'web' if not provided
  } = req.body;
  
  const userId = req.user._id;

  // 1. Basic Validation (Required for both Web & Mobile)
  if (!sleepStartTime || !sleepEndTime) {
    res.status(400);
    throw new Error('Sleep start and end times are required');
  }

  // Default values for Web/Manual entry
  let quality = 0; // 0 means "Not Analyzed"
  let interruptions = 0;
  let analysisNotes = "Manual Entry (Web)";
  let detectedSource = source;

  // 2. Advanced AI Analysis (Only if sensor data is present - likely from Mobile)
  if (accelerometerData && screenData) {
    try {
        console.log("🧠 Starting AI Sleep Analysis...");
        const analysis = await analyzeSleepData(accelerometerData, screenData);
        
        quality = analysis.quality; // Should be a score (0-100)
        interruptions = analysis.interruptions;
        analysisNotes = "AI Analysis (Mobile Sensors)";
        detectedSource = 'mobile'; // Force source to mobile if sensors are used

    } catch (error) {
        console.error("⚠️ AI Sleep Analysis Failed (Falling back to basic log):", error.message);
        // Do NOT throw error here. Save data as basic log instead.
        analysisNotes = `AI Failed: ${error.message}. Saved as basic entry.`;
    }
  }

  // Calculate Duration in Hours
  const duration = (new Date(sleepEndTime) - new Date(sleepStartTime)) / 3600000;

  // 3. Save to Database
  const sleepLog = await SleepLog.create({
    user: userId,
    sleepStartTime,
    sleepEndTime,
    duration,
    quality,
    interruptions,
    notes: analysisNotes,
    source: detectedSource
  });

  res.status(201).json({
    success: true,
    data: sleepLog,
    message: accelerometerData ? "Sleep logged with AI analysis" : "Sleep logged successfully"
  });
});

export const getSleepHistory = getAll(SleepLog, 'sleepHistory');