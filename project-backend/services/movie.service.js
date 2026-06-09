import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY; // Ensure ye .env me ho
if (!API_KEY) {
  console.error("❌ TMDB_API_KEY missing");
}

// --- 1. Language Mapping (ISO 639-1 Codes) ---
const LANG_MAP = {
    'Hindi': 'hi',
    'English': 'en',
    'Punjabi': 'pa',
    'Tamil': 'ta',
    'Telugu': 'te',
    'Malayalam': 'ml',
    'Bengali': 'bn',
    'Marathi': 'mr',
    'Kannada': 'kn',
    'Gujarati': 'gu'
};

// --- 2. Genre Mapping (TMDB IDs) ---
const GENRE_MAP = {
    'Action': 28, 
    'Comedy': 35, 
    'Horror': 27, 
    'Romance': 10749, 
    'Sci-Fi': 878, 
    'Drama': 18, 
    'Thriller': 53, 
    'Animation': 16,
    'Documentary': 99,
    'Mystery': 9648,
    'Crime': 80
};

export const fetchMovies = async (mood, userId, preferences) => {
  try {
    // --- A. INTELLIGENCE GATHERING ---

    // 1. Language Logic (Regional Bias) 🇮🇳
    let isoLang = 'hi'; // Default Hindi (India First)
    
    if (preferences?.languages?.length > 0) {
        // User ki pasandida languages me se randomly ek pick karo
        const userLang = preferences.languages[Math.floor(Math.random() * preferences.languages.length)];
        isoLang = LANG_MAP[userLang] || 'hi';
    }

    // 2. Genre Logic (Mood + Preferences)
    let genreIds = [];
    
    // a. Mood ke hisaab se Genres decide karo
    switch (mood) {
        case 'happy': genreIds.push(35, 16, 10402); break; // Comedy, Animation, Music
        case 'sad': genreIds.push(18, 10749); break; // Drama, Romance
        case 'angry': genreIds.push(28, 80, 53); break; // Action, Crime, Thriller
        case 'excited': genreIds.push(28, 878, 12); break; // Action, Sci-Fi, Adventure
        case 'relaxed': genreIds.push(99, 36, 10751); break; // Docu, History, Family
        case 'bored': genreIds.push(53, 9648, 27); break; // Thriller, Mystery, Horror
        default: genreIds.push(35); // Default Comedy
    }

    // b. User Preferences add karo (Explicit Choice)
    if (preferences?.movieGenres?.length > 0) {
        // User ka pehla pasandida genre priority pe rakho
        const userGenreId = GENRE_MAP[preferences.movieGenres[0]];
        if (userGenreId) {
            // Unshift taaki ye array ke start me aa jaye (Priority)
            genreIds.unshift(userGenreId); 
        }
    }

    // Array ko string banao API ke liye (e.g., "28,35")
    const genreString = genreIds.slice(0, 3).join(','); // Top 3 genres hi bhejo

    console.log(`🎬 [Movie AI] Searching: Lang=${isoLang} | Genres=${genreString} | Mood=${mood}`);

    // --- B. API CALL (Discovery Mode) ---
    const { data } = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: API_KEY,
        with_original_language: isoLang, // 👈 Ye user ki bhasha layega
        with_genres: genreString,
        sort_by: 'popularity.desc', // Jo abhi famous h
        region: 'IN', // India region me available movies
        page: 1,
        include_adult: false
      }
    });

    if (!data.results) return [];

    // --- C. FORMATTING ---
    return data.results
  .filter(movie => movie.title && movie.poster_path) // 🔥 EMPTY MOVIES HATAO
  .map(movie => ({
    type: 'movie',
    source: 'TMDB',

    title: movie.title,

    // 👇 FRONTEND KE HISAB SE
    content: movie.overview && movie.overview.length > 20
      ? movie.overview.slice(0, 120)
      : `A popular ${movie.title} movie`,

    description: movie.overview || '',

    contentId: movie.id,

    image_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,

    rating: movie.vote_average,
    language: movie.original_language,
  }));


  } catch (error) {
    console.error("TMDB Movie Error:", error.message);
    return [];
  }
};