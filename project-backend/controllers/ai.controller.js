import asyncHandler from 'express-async-handler';
import { 
  detectMoodStrategy, 
  chatWithAI, 
  analyzeVoiceMood, 
  processFaceMood 
} from '../services/ai.service.js';
import MoodLog from '../models/moodLog.model.js';
import { MOODS } from '../config/constants.js';

/**
 * @desc    Analyze text using Hybrid Strategy (AI + Rule-Based)
 * @route   POST /api/ai/analyze-text
 * @access  Private
 */
export const analyzeText = asyncHandler(async (req, res) => {
  const { text, saveLog = false } = req.body;

  // 1. Validation
  if (!text) {
    res.status(400);
    throw new Error('Text is required for analysis');
  }

  // 2. Call the Strategy (No complex logic here!)
  const result = await detectMoodStrategy(text);

  // 3. Optional: Auto-save to DB if requested by Frontend
  if (saveLog && req.user) {
    await MoodLog.create({
      user: req.user._id,
      mood: result.mood,
      notes: text, // Original text
      source: 'text_analysis',
      metadata: {
        method: result.method,
        confidence: result.confidence
      }
    });
  }

  res.json({
    success: true,
    data: result
  });
});

/**
 * @desc    Chat with AI Assistant (Context Aware)
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const handleChat = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  const reply = await chatWithAI(message, history);

  res.json({
    success: true,
    reply
  });
});


export const handleChatEnd = asyncHandler(async (req, res) => {
   console.log('🔥 CHAT END HIT');
  console.log('Conversation:', req.body.conversation);
  const { conversation } = req.body;

  if (!conversation || conversation.length < 10) {
    return res.json({ success: false, message: 'Conversation too short' });
  }

  // 🧠 Mood from full conversation
  const moodResult = await detectMoodStrategy(conversation);
const finalMood = moodResult?.mood || MOODS.NEUTRAL;

let moodLog = null;
if (req.user) {
  moodLog = await MoodLog.create({
    user: req.user._id,
    mood: finalMood,
    notes: 'Auto-detected from chat session',
    source: 'chat'
  });
}

res.json({
  success: true,
  mood: finalMood,
  confidence: moodResult?.confidence || 'low'
});

});



/**
 * @desc    Analyze Voice Audio
 * @route   POST /api/ai/analyze-voice
 * @access  Private
 */
export const analyzeVoice = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Audio file is required');
  }

  let rawResult;
  try {
    rawResult = await analyzeVoiceMood(
      req.file.buffer,
      req.file.originalname
    );
  } catch (err) {
    console.error('Voice Service Error:', err.message);
    return res.status(502).json({
      success: false,
      error: 'Voice analysis service failed'
    });
  }

  // ✅ SAFE RESULT BUILD
  const result = {
    mood: rawResult?.mood || 'neutral',
    source: 'voice',
    notes:
      rawResult?.notes ||
      rawResult?.note ||
      `Voice analysis result: ${rawResult?.mood || 'neutral'}`
  };

  // ✅ SAFE CHECK (no crash)
  if (
    req.user &&
    result.mood &&
    typeof result.notes === "string" &&
    !result.notes.includes('silence')
  ) {
    await MoodLog.create({
      user: req.user._id,
      mood: result.mood,
      notes: result.notes,
      source: 'voice'
    });
  }

  console.log("🎯 Final Result:", result);

  res.json({
    success: true,
    data: result
  });
});


/**
 * @desc    Process Face Mood (Sent from Frontend Models)
 * @route   POST /api/ai/process-face
 * @access  Private
 */
export const analyzeFace = asyncHandler(async (req, res) => {
  const { detectedMood } = req.body;

  if (!detectedMood) {
    res.status(400);
    throw new Error('Detected mood is required');
  }

  // Validate and Normalize via Service
  const result = processFaceMood(detectedMood);

  // Save to DB
  if (req.user) {
    await MoodLog.create({
      user: req.user._id,
      mood: result.mood,
      notes: 'Detected via Face Expression',
      source: 'face'
    });
  }

  res.json({
    success: true,
    data: result
  });
});