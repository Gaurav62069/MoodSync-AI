//ai.services.js
import Sentiment from "sentiment";
import axios from "axios";
import FormData from "form-data";
import Groq from "groq-sdk";
import { MOODS } from "../config/constants.js"; // Centralized Constants

// --- CONFIGURATION ---

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Development me localhost, Production me Environment Variable
const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://127.0.0.1:5001";

// --- 1. RULE-BASED SENTIMENT ANALYSIS (Offline & Fast) ---
export const analyzeTextSentiment = (text) => {
  const sentiment = new Sentiment();
  const result = sentiment.analyze(text);

  let mood = MOODS.NEUTRAL;
  if (result.score > 1) {
    mood = MOODS.HAPPY;
  } else if (result.score < -3) {
    mood = MOODS.STRESSED;
  } else if (result.score < -1) {
    mood = MOODS.SAD;
  } else if (result.score === 0 && text.length > 10) {
    mood = MOODS.BORED;
  }

  return {
    mood: mood,
    score: result.score,
    notes: text,
  };
};

// --- 2. AI MOOD DETECTION (LLM - Llama 3) ---
export const detectMoodWithAI = async (text) => {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const validMoods = Object.values(MOODS).join(", ");
    const systemPrompt = `
      Analyze the sentiment of the following user text.
      Determine the user's mood from this list ONLY: 
      [${validMoods}].
      
      Ignore spelling mistakes.
      Output Format: Just the mood word (lowercase). Nothing else.
    `;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const detectedMood = completion.choices[0].message.content
      .trim()
      .toLowerCase();

    // Clean up response (remove punctuation/spaces)
    const cleanMood = detectedMood.replace(/[^a-z]/g, "");

    // Validate if the AI returned a known mood
    const normalizedMoods = Object.values(MOODS).map((m) => m.toLowerCase());

    if (normalizedMoods.includes(cleanMood)) {
      return cleanMood;
    }

    return MOODS.NEUTRAL;
  } catch (error) {
    console.error("AI Mood Detection Failed:", error.message);
    return null; // Return null so strategy knows AI failed
  }
};

// --- 3. MOOD DETECTION STRATEGY (The "Brain") ---
/**
 * Decides whether to use High-Quality AI or Fast Rule-Based logic.
 * Fallback mechanism included.
 */
export const detectMoodStrategy = async (text) => {
  if (!text || text.trim().length === 0) {
    throw new Error("Text is required for mood detection");
  }

  try {
    // Priority 1: Try Advanced AI (LLM)
    const aiMood = await detectMoodWithAI(text);

    if (aiMood && aiMood !== MOODS.NEUTRAL) {
      return {
        mood: aiMood,
        method: "AI_LLM",
        confidence: "High",
        notes: text,
      };
    }

    // Priority 2: Fallback to Rule-Based (Sentiment Lib)
    // Runs if AI fails or returns Neutral (maybe text was too simple)
    const ruleBasedResult = analyzeTextSentiment(text);

    return {
      mood: ruleBasedResult.mood,
      method: "RULE_BASED",
      score: ruleBasedResult.score,
      confidence: Math.abs(ruleBasedResult.score) > 2 ? "Medium" : "Low",
      notes: text,
    };
  } catch (error) {
    console.error("Strategy Fallback Error:", error.message);
    // Priority 3: Ultimate Fallback
    return {
      mood: MOODS.NEUTRAL,
      method: "FALLBACK",
      confidence: "None",
      notes: text,
    };
  }
};

// --- 4. VOICE ANALYSIS (Python Server) ---
export const analyzeVoiceMood = async (audioBuffer, originalname) => {
  const endpoint = `${AI_SERVER_URL}/analyze-voice`;

  // 🔥 ADD THIS (TOP)
  const normalizeMood = (mood) => {
    const map = {
      fearful: "fear",
      surprised: "excited",
      disgust: "stressed",
    };
    return map[mood] || mood;
  };

  try {
    const formData = new FormData();

    formData.append("audio", audioBuffer, {
      filename: originalname,
    });

    const response = await axios.post(endpoint, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 60000,
    });

    const data = response?.data;

    if (!data || typeof data !== "object") {
      throw new Error("Invalid response from AI Server");
    }

    if (!data.success) {
      return {
        mood: MOODS.NEUTRAL,
        source: "voice",
        notes: data.error || "Voice analysis failed",
      };
    }

    console.log("🔍 Python Response:", data);

    // 🔥 FIXED NORMALIZATION
    const normalizedMood = normalizeMood(
      typeof data.mood === "string" ? data.mood.toLowerCase() : "neutral",
    );

    const finalMood = Object.values(MOODS)
      .map((m) => m.toLowerCase())
      .includes(normalizedMood)
      ? normalizedMood
      : MOODS.NEUTRAL;

    return {
      mood: finalMood,
      source: "voice",
      notes: data?.note || data?.notes || `Voice analysis result: ${finalMood}`,
    };
  } catch (error) {
    console.error("❌ Voice Analysis Error:", error.message);

    if (error.code === "ECONNREFUSED") {
      throw new Error("AI Server is unreachable. Is Python server running?");
    }

    throw error;
  }
};

// --- 5. SLEEP ANALYSIS (Python Server) ---
export const analyzeSleepData = async (accelerometerData, screenData) => {
  const endpoint = `${AI_SERVER_URL}/analyze-sleep`;

  try {
    const response = await axios.post(
      endpoint,
      {
        accData: accelerometerData,
        scrData: screenData,
      },
      {
        timeout: 8000,
      },
    );

    const { data } = response;
    if (!data.success) {
      throw new Error(data.error || "Sleep analysis failed");
    }

    return {
      quality: data.quality || 50,
      interruptions: data.interruptions || 0,
    };
  } catch (error) {
    console.error("❌ Sleep Analysis Error:", error.message);
    // Non-blocking error for sleep (handled in controller)
    throw new Error("Sleep analysis service unavailable");
  }
};

// --- 6. FACE MOOD PROCESSING ---
export const processFaceMood = (detectedMood) => {
  const validMoods = Object.values(MOODS);
  if (!validMoods.includes(detectedMood)) {
    throw new Error(
      `Invalid mood detected from face analysis: ${detectedMood}`,
    );
  }

  return {
    mood: detectedMood,
    source: "face",
    notes: "Mood detected via face analysis",
  };
};

// --- 7. CHATBOT (Context Aware) ---
export const chatWithAI = async (userInput, history = []) => {
  try {
    if (!userInput || typeof userInput !== "string") {
      throw new Error("Invalid user input");
    }

    const messages = [
      {
        role: "system",
        content:
          "You are MoodSync, a friendly and supportive AI wellness assistant.",
      },
    ];

    // ✅ SAFE history handling
    if (Array.isArray(history)) {
      history.forEach((msg) => {
        if (msg?.role && msg?.content) {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      });
    }

    // ✅ Current user message
    messages.push({
      role: "user",
      content: userInput,
    });

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error("❌ chatWithAI FULL ERROR:", err);
    throw err;
  }
};
