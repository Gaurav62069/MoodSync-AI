// Centralized Mood Constants
export const MOODS = {
  HAPPY: 'happy',
  SAD: 'sad',
  ANGRY: 'angry',
  STRESSED: 'stressed',
  BORED: 'bored',
  CALM: 'calm',
  NEUTRAL: 'neutral',
  EXCITED: 'excited',
  ANXIOUS: 'anxious'
};

// Mood Scores for Graphs/Calculations
export const MOOD_SCORES = {
  [MOODS.HAPPY]: 80,
  [MOODS.EXCITED]: 90,
  [MOODS.CALM]: 70,
  [MOODS.NEUTRAL]: 50,
  [MOODS.BORED]: 40,
  [MOODS.STRESSED]: 30,
  [MOODS.ANXIOUS]: 25,
  [MOODS.SAD]: 20,
  [MOODS.ANGRY]: 10
};

// Valid Sources
export const LOG_SOURCES = {
  WEB: 'web',
  MOBILE: 'mobile',
  DEVICE: 'device',
  MANUAL: 'manual'
};