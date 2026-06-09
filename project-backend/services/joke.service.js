import axios from 'axios';

// JokeAPI Categories (Jo API support karti hai)
const JOKE_CATEGORIES = [
  "Programming",
  "Misc",
  "Dark",
  "Pun",
  "Spooky",
  "Christmas"
];

/**
 * Fetches Joke suggestions blending Mood + User Preferences
 * @param {string} mood - Current mood
 * @param {string} country - ISO Code
 * @param {string} userId - User ID
 * @param {object} preferences - User prefs { jokeCategories: ['Programming', 'Pun'] }
 */
export const fetchJoke = async (mood, country, userId, preferences) => {
  // 1. Default Category based on Mood
  let categories = ["Any"];
  
  // Mood ke hisaab se safe defaults
  if (mood === 'sad') categories = ["Pun", "Misc"]; // Light humor to cheer up
  if (mood === 'bored') categories = ["Programming", "Misc", "Pun"]; // Interesting stuff
  if (mood === 'angry') categories = ["Misc"]; // Safe, neutral humor
  if (mood === 'happy') categories = ["Programming", "Misc"]; 

  // 2. PERSONALIZATION: User Preference Override
  // Agar user ne profile mein joke categories select ki hain, toh unhe priority do
  if (preferences?.jokeCategories && preferences.jokeCategories.length > 0) {
      // User ke select kiye hue valid categories filter karo (Security check)
      const userCats = preferences.jokeCategories.filter(c => JOKE_CATEGORIES.includes(c));
      
      if (userCats.length > 0) {
          categories = userCats;
      }
  }

  // Join categories string (e.g., "Programming,Pun")
  const categoryString = categories.join(',');

  // URL Construction
  // amount=4: 4 jokes ek saath laane ke liye
  // blacklistFlags: NSFW, racist, sexist content ko filter karne ke liye (Safe Mode)
  const jokeUrl = `https://v2.jokeapi.dev/joke/${categoryString}?type=single&amount=4&blacklistFlags=nsfw,racist,sexist`;

  try {
    const { data } = await axios.get(jokeUrl);
    
    // API Error Handling
    if (data.error) {
        // Code 106: No jokes found for these categories/flags.
        // Fallback: Retry with generic parameters (Safe recursion)
        if (data.code === 106) { 
             console.log("No specific jokes found, fetching generic jokes...");
             return fetchJoke(mood, country, userId, {}); // Empty prefs pass karke retry karo
        }
        throw new Error('Joke API Error');
    }

    // JokeAPI Structure Handle:
    // Single joke: data object hota hai.
    // Multiple jokes: data.jokes array hota hai.
    const jokesArray = data.jokes || (data.joke ? [data] : []);

    // 3. Format Data
    return jokesArray.map(j => ({
      type: 'joke',
      source: 'JokeAPI',
      // Kabhi single line joke hota hai, kabhi setup/delivery (Two part)
      joke: j.joke || `${j.setup} ... ${j.delivery}`,
      category: j.category,
      contentId: j.id.toString(),
    }));

  } catch (error) {
    console.error('🔴 Joke API Error:', error.message);
    
    // 4. Fallback: Offline/Local Jokes (Agar API fail ho jaye)
    return [
      { 
        type: 'joke', 
        source: 'Local', 
        joke: "Why do Java developers wear glasses? Because they don't C#.", 
        contentId: 'loc1',
        category: 'Programming'
      },
      { 
        type: 'joke', 
        source: 'Local', 
        joke: "Debugging is like being the detective in a crime movie where you are also the murderer.", 
        contentId: 'loc2',
        category: 'Programming'
      },
      { 
        type: 'joke', 
        source: 'Local', 
        joke: "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'", 
        contentId: 'loc3',
        category: 'Programming'
      },
      { 
        type: 'joke', 
        source: 'Local', 
        joke: "Parallel lines have so much in common. It’s a shame they’ll never meet.", 
        contentId: 'loc4',
        category: 'Pun'
      }
    ];
  }
};