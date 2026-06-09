import axios from 'axios';

// NewsAPI Language Codes (Free tier supports limited languages)
const LANG_MAP = {
    'Hindi': 'hi',
    'English': 'en',
    // NewsAPI mostly supports 'en', 'hi', 'ar', 'es', etc.
    // Regional languages like Punjabi/Tamil might not be supported directly by code,
    // so we fallback to 'en' but search with keywords.
};

export const fetchNews = async (mood, country, userId, preferences) => {
  try {
    // --- 1. LANGUAGE LOGIC ---
    let langCode = 'en'; // Default English
    
    // Check if user prefers Hindi
    if (preferences?.languages?.includes('Hindi')) {
        langCode = 'hi';
    }

    // --- 2. MOOD TO TOPIC MAPPING ---
    let topic = "";
    
    // Note: GNews query logic is slightly different, keywords work best
    switch (mood) {
        case 'happy': 
            topic = "Bollywood OR Cricket OR Festivals OR Positive"; 
            break;
        case 'sad': 
            topic = "Inspiring OR Wellness OR Nature"; 
            break; 
        case 'angry': 
            topic = "Meditation OR Mindfulness OR Peace"; 
            break; 
        case 'excited': 
            topic = "Technology OR Startups OR Space OR Gaming"; 
            break;
        case 'relaxed': 
            topic = "Travel OR Food OR Culture OR Art"; 
            break;
        case 'bored': 
            topic = "Movies OR Viral OR Entertainment"; 
            break;
        default: 
            topic = "Trending";
    }

    // --- 3. CONSTRUCT QUERY ---
    // GNews expects lowercase country code (e.g., 'in')
    const targetCountry = country ? country.toLowerCase() : 'in';

    console.log(`📰 [GNews AI] Searching: "${topic}" | Lang: ${langCode} | Country: ${targetCountry}`);

    const { data } = await axios.get('https://gnews.io/api/v4/search', {
      params: {
        q: topic,       // Keywords
        lang: langCode, // 'en', 'hi', etc.
        country: targetCountry, // 'in', 'us'
        max: 12,        // Number of results
        apikey: process.env.GNEWS_API_KEY // Make sure this is in your .env
      }
    });

    if (!data.articles) return [];

    // --- 4. FORMATTING ---
    return data.articles
      .map(article => ({
        type: 'news',
        source: article.source.name,
        title: article.title,
        content: article.description || 'Click to read more...',
        
        // GNews key names are slightly different from NewsAPI
        news_url: article.url, 
        image_url: article.image, // GNews uses 'image', NewsAPI used 'urlToImage'
        publishedAt: article.publishedAt,
        
        isExternal: true 
    }));

  } catch (error) {
    console.error("GNews Fetch Error:", error.message);
    return [];
  }
};