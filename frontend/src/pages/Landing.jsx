import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Sparkles as SparklesIcon,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";
import SparklesCore from "../components/Sparkles";
import ScrollableCardStack from "../components/smoothui/scrollable-card-stack";
import CursorFollow from "../components/smoothui/cursor-follow";
import { fetchAlbumArt } from "../lib/fetchArtwork";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const islandSongs = [
  {
    name: "Kesariya",
    artist: "Arijit Singh",
    query: "Kesariya Brahmastra Pritam",
  },
  {
    name: "Raabta",
    artist: "Arijit Singh",
    query: "Raabta Agent Vinod Pritam",
  },
  {
    name: "Channa Mereya",
    artist: "Arijit Singh",
    query: "Channa Mereya Ae Dil Hai Mushkil",
  },
  { name: "Jeena Jeena", artist: "Atif Aslam", query: "Jeena Jeena Badlapur" },
  {
    name: "Samjhawan",
    artist: "Arijit Singh, Shreya Ghoshal",
    query: "Samjhawan Humpty Sharma Ki Dulhania",
  },
];

const stackSongs = [
  {
    id: "1",
    name: "Kesariya",
    handle: "Arijit Singh",
    query: "Kesariya Brahmastra Pritam",
    href: "#",
  },
  {
    id: "2",
    name: "Raabta",
    handle: "Arijit Singh",
    query: "Raabta Agent Vinod Pritam",
    href: "#",
  },
  {
    id: "3",
    name: "Tum Hi Ho",
    handle: "Arijit Singh",
    query: "Tum Hi Ho Aashiqui 2",
    href: "#",
  },
  {
    id: "4",
    name: "Kabhi Kabhi Aditi",
    handle: "Rashid Ali, A.R. Rahman",
    query: "Kabhi Kabhi Aditi Jaane Tu Ya Jaane Na",
    href: "#",
  },
];

function MusicIsland({ songs }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [artwork, setArtwork] = useState({});

  useEffect(() => {
    songs.forEach(async (song) => {
      const url = await fetchAlbumArt(song.query);
      setArtwork((prev) => ({ ...prev, [song.query]: url }));
    });
  }, [songs]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % songs.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [playing, songs.length]);

  const current = songs[index];
  const art = artwork[current.query];

  return (
    <div className="mx-auto w-fit rounded-[32px] bg-black border border-white/10 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 w-80">
        <div className="w-11 h-11 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
          {art && (
            <img
              src={art}
              alt={current.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <motion.p
            key={current.name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-white truncate"
          >
            {current.name}
          </motion.p>
          <p className="text-xs text-neutral-400 truncate">{current.artist}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setIndex((i) => (i - 1 + songs.length) % songs.length)
            }
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <SkipBack size={14} className="text-white" />
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            {playing ? (
              <Pause size={14} className="text-white" />
            ) : (
              <Play size={14} className="text-white" />
            )}
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % songs.length)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <SkipForward size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Landing() {
  const [stackItems, setStackItems] = useState(
    stackSongs.map((s) => ({ ...s, image: null, avatar: null })),
  );

  useEffect(() => {
    stackSongs.forEach(async (song, i) => {
      const url = await fetchAlbumArt(song.query);
      setStackItems((prev) => {
        const next = [...prev];
        next[i] = { ...next[i], image: url, avatar: url };
        return next;
      });
    });
  }, []);

  return (
    <CursorFollow>
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center px-6">
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={70}
            particleColor="#1ed760"
            speed={0.6}
            className="w-full h-full"
          />
        </div>

        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: "radial-gradient(circle, #1ed760 0%, transparent 70%)",
          }}
        />

        <motion.div
          className="relative text-center max-w-2xl z-10"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-neutral-400 mb-6"
            data-cursor-text="Hey!"
          >
            <SparklesIcon size={12} className="text-[#1ed760]" />
            Personal music intelligence, powered by your own data
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-4xl sm:text-5xl font-semibold leading-tight mb-5"
          >
            Understand the music
            <br />
            you actually listen to.
          </motion.h1>

          <motion.p
            variants={item}
            className="text-neutral-400 text-base sm:text-lg mb-8 max-w-lg mx-auto"
          >
            Rediscover forgotten favorites, see how far your listening bubble
            really extends, and get a behavioural profile built entirely from
            your own Spotify history.
          </motion.p>

          <motion.div variants={item} className="mb-10 flex justify-center">
            <MusicIsland songs={islandSongs} />
          </motion.div>

          <motion.a
            variants={item}
            href="http://127.0.0.1:8000/auth/login"
            data-cursor-text="Let's go"
            className="inline-block bg-[#1ed760] hover:bg-[#1fdf64] text-black font-semibold px-7 py-3.5 rounded-full transition-colors duration-200 shadow-[0_0_40px_-10px_#1ed760]"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Connect Spotify
          </motion.a>
        </motion.div>
      </div>

      <section className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-24">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4 text-center">
          Every scroll, a different sound.
        </h2>
        <p className="text-neutral-400 mb-16 text-center max-w-md">
          Scroll or use arrow keys to move through the stack.
        </p>
        <ScrollableCardStack items={stackItems} cardHeight={340} />
      </section>
    </CursorFollow>
  );
}

export default Landing;
