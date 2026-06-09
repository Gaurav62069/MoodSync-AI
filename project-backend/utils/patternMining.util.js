// patternMining.util.js
import Log from "../models/log.model.js"; // Ya jo bhi apka history model h

export const getUserPattern = async (userId, type) => {
  try {
    // 1. Fetch last 20 interactions of specific type (song/video)
    const history = await Log.find({ user: userId, type: type })
      .sort({ createdAt: -1 })
      .limit(20);

    if (history.length === 0) return null;

    // 2. Frequency Analysis (Data Mining Step)
    // Title aur Description se keywords nikal kar count karenge
    const keywordMap = {};

    history.forEach((log) => {
      // Simple heuristic: Title ke words ko token banao
      const words = log.title.split(" ");
      words.forEach((w) => {
        const word = w.toLowerCase().replace(/[^a-zA-Z]/g, "");
        if (word.length > 3) {
          // Ignore small words like 'the', 'is'
          keywordMap[word] = (keywordMap[word] || 0) + 1;
        }
      });
    });

    // 3. Sort by frequency (Sabse zyada repeat hone wala word)
    const sortedKeywords = Object.entries(keywordMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // Top 3 keywords (e.g., "arijit", "lofi", "remix")
      .map((entry) => entry[0]);

    return sortedKeywords.join(" "); // Returns: "arijit lofi"
  } catch (error) {
    console.error("Pattern Mining Error:", error);
    return null;
  }
};
