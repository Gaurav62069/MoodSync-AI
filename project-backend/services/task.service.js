import Task from '../models/task.model.js';

/**
 * Fetches Task suggestions blending Mood + User Preferences
 * @param {string} mood - Current mood (e.g., 'happy', 'sad')
 * @param {string} country - ISO Code (Not strictly used here but kept for consistency)
 * @param {string} userId - User ID
 * @param {object} preferences - User prefs { taskPreferences: ['Outdoor', 'Creative'] }
 */
export const fetchTask = async (mood, country, userId, preferences) => {
  try {
    // 1. Build Query Match Stage
    // Mood match karna mandatory hai
    let matchStage = { moodTags: mood };

    // 2. PERSONALIZATION: Filter by Task Category if User has preferences
    // Maan lijiye Task model mein 'category' field hai (e.g. 'Social', 'Physical', 'Intellectual')
    if (preferences?.taskPreferences && preferences.taskPreferences.length > 0) {
        // Agar user ne preferences set ki hain, to unhe prioritize karo
        matchStage.category = { $in: preferences.taskPreferences };
    }

    // 3. Primary Query: Mood + Preferences
    // aggregate() use karke random 4 tasks nikalenge jo mood aur interest dono match karein
    let tasks = await Task.aggregate([
      { $match: matchStage }, 
      { $sample: { size: 4 } }
    ]);

    // 4. Fallback Level 1: Agar personalized tasks nahi mile (ya kam mile)
    // Toh sirf Mood ke hisaab se tasks dhoondo (Preferences ignore karke)
    if (!tasks || tasks.length === 0) {
      // console.log("Personalized tasks not found. Falling back to mood-only tasks.");
      tasks = await Task.aggregate([
        { $match: { moodTags: mood } },
        { $sample: { size: 4 } }
      ]);
    }

    // 5. Fallback Level 2: Agar Mood ke hisaab se bhi nahi mile (Rare case)
    // Toh koi bhi random 4 tasks utha lo
    if (!tasks || tasks.length === 0) {
      tasks = await Task.aggregate([
        { $sample: { size: 4 } }
      ]);
    }

    // 6. Ultimate Fallback: Agar Database bilkul khaali hai (Zero tasks in DB)
    if (!tasks || tasks.length === 0) {
      // Return array containing one dummy task so UI doesn't break
      return [{
        type: 'task',
        title: "Take a Deep Breath",
        description: "Close your eyes and take 5 deep breaths to reset your mind.",
        difficulty: 'easy',
        contentId: 'fallback-dummy-1',
        category: 'Mindfulness'
      }];
    }

    // 7. Format Data for Frontend
    return tasks.map(task => ({
      type: 'task',
      source: 'Internal', // DB se aa raha hai
      title: task.title,
      description: task.description,
      difficulty: task.difficulty, // 'easy', 'medium', 'hard'
      contentId: task._id.toString(),
      category: task.category || 'General', // UI pe badge dikhane ke liye
      timeRequired: task.timeRequired || '5 min' // Optional field
    }));

  } catch (error) {
    console.error("🔴 Task Fetch Error:", error.message);
    // Error aane par empty array return karo taaki app crash na ho
    return []; 
  }
};