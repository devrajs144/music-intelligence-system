import { createContext, useContext, useState } from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function playSong(song, art) {
    setNowPlaying({ ...song, art });
    setIsPlaying(true);
  }

  function togglePlay() {
    setIsPlaying((p) => !p);
  }

  return (
    <PlayerContext.Provider
      value={{ nowPlaying, isPlaying, playSong, togglePlay }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
