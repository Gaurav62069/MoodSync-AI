// cache.service.js
import NodeCache from "node-cache";

// Cache duration: 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600 });

export const getFromCache = (key) => {
  const value = cache.get(key);
  if (value) {
    console.log(`🟢 Cache HIT for key: ${key}`);
    return value;
  }
  return null;
};

export const saveToCache = (key, data) => {
  console.log(`🔴 Cache MISS. Saving key: ${key}`);
  cache.set(key, data);
};

export const clearCache = () => {
  cache.flushAll();
  console.log("🧹 Cache Cleared");
};
