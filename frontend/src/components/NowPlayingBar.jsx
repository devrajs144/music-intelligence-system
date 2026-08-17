import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Cast, CheckCircle2 } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

function NowPlayingBar() {
  const { nowPlaying, isPlaying, togglePlay } = usePlayer();

  return (
    <AnimatePresence>
      {nowPlaying && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#3d1a1a] to-neutral-900 border-t border-white/10 px-4 py-2.5"
        >
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded overflow-hidden bg-neutral-800 flex-shrink-0">
              {nowPlaying.art && (
                <img
                  src={nowPlaying.art}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white truncate">{nowPlaying.title}</p>
              <p className="text-xs text-neutral-400 truncate">
                {nowPlaying.artist}
              </p>
            </div>
            <Cast size={16} className="text-[#1ed760] hidden sm:block" />
            <CheckCircle2
              size={16}
              className="text-[#1ed760] hidden sm:block"
            />
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0"
            >
              {isPlaying ? (
                <Pause size={14} className="text-black" fill="black" />
              ) : (
                <Play size={14} className="text-black ml-0.5" fill="black" />
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NowPlayingBar;
