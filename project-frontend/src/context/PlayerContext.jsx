import React, { createContext, useContext, useState } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentMedia, setCurrentMedia] = useState(null);

  // Media play karne ka function
  const playMedia = (item) => {
    setCurrentMedia(item);
  };

  // Media close karne ka function
  const closeMedia = () => {
    setCurrentMedia(null);
  };

  return (
    <PlayerContext.Provider value={{ currentMedia, playMedia, closeMedia }}>
      {children}
    </PlayerContext.Provider>
  );
};