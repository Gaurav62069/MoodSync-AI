import axios from "axios";

// Mood → Subject Mapping
const MOOD_SUBJECTS = {
  happy: ["motivation", "success", "biography"],
  sad: ["self-help", "inspiration", "psychology"],
  angry: ["philosophy", "mindfulness", "psychology"],
  calm: ["meditation", "philosophy", "history"],
  bored: ["science fiction", "mystery", "fantasy"],
  stressed: ["self-help", "mindfulness", "psychology"],
  anxious: ["mindfulness", "self-help", "mental health"],
  excited: ["business", "success", "biography"],
  neutral: ["fiction", "history", "science"],
};

export const fetchBook = async (mood, country = "IN", userId, preferences) => {
  try {
    const subjects = MOOD_SUBJECTS[mood] || MOOD_SUBJECTS["neutral"];

    const selectedSubject =
      subjects[Math.floor(Math.random() * subjects.length)];

    console.log(`📚 [OpenLibrary] Subject: ${selectedSubject}`);

    const { data } = await axios.get(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(
        selectedSubject,
      )}&limit=10`,
    );

    if (!data?.docs?.length) {
      return [];
    }

    return data.docs
      .filter((book) => book.title)
      .map((book) => ({
        type: "book",
        source: "Open Library",

        title: book.title,

        content: book.author_name?.join(", ") || "Unknown Author",

        contentId: book.key || `${book.title}-${Math.random()}`,

        image_url: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
          : null,

        authors: book.author_name || ["Unknown Author"],

        publishedDate: book.first_publish_year || "Unknown",

        rating: null,

        book_url: book.key ? `https://openlibrary.org${book.key}` : null,

        category: selectedSubject,
      }));
  } catch (error) {
    console.error(
      "🔴 Open Library Error:",
      error.response?.data || error.message,
    );

    return [
      {
        type: "book",
        source: "Fallback",
        title: "Atomic Habits",
        content: "Build good habits and break bad ones.",
        contentId: "atomic-habits",
        authors: ["James Clear"],
        image_url: null,
        book_url: null,
      },
      {
        type: "book",
        source: "Fallback",
        title: "Deep Work",
        content: "Focused success in a distracted world.",
        contentId: "deep-work",
        authors: ["Cal Newport"],
        image_url: null,
        book_url: null,
      },
    ];
  }
};
