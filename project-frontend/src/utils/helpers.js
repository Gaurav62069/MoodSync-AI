// Mood mapping colors and scores
export const getMoodScore = (mood) => {
  const scores = {
    happy: 80,
    excited: 90,
    calm: 70,
    neutral: 50,
    bored: 40,
    stressed: 30,
    sad: 20,
    angry: 10,
    anxious: 25
  };
  return scores[mood?.toLowerCase()] || 50;
};

export const getMoodColor = (mood) => {
  const colors = {
    happy: '#FFD700',   // Gold
    sad: '#4682B4',     // SteelBlue
    angry: '#FF4500',   // OrangeRed
    neutral: '#A9A9A9', // DarkGray
    stressed: '#800080',// Purple
    calm: '#00FA9A'     // MediumSpringGreen
  };
  return colors[mood?.toLowerCase()] || '#cccccc';
};