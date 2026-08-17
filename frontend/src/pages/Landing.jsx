import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Sparkles as SparklesIcon,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Download,
  MoreHorizontal,
} from "lucide-react";
import SparklesCore from "../components/Sparkles";
import CursorFollow from "../components/smoothui/cursor-follow";
import { fetchAlbumArt } from "../lib/fetchArtwork";
import { usePlayer } from "../context/PlayerContext";

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

const playlists = [
  {
    title: "Arijit Essentials",
    stats: "8 songs",
    coverQuery: "Kesariya Brahmastra Pritam",
    songs: [
      {
        title: "Kesariya",
        artist: "Arijit Singh",
        query: "Kesariya Brahmastra Pritam",
      },
      {
        title: "Raabta",
        artist: "Arijit Singh",
        query: "Raabta Agent Vinod Pritam",
      },
      {
        title: "Tum Hi Ho",
        artist: "Arijit Singh",
        query: "Tum Hi Ho Aashiqui 2",
      },
      {
        title: "Channa Mereya",
        artist: "Arijit Singh",
        query: "Channa Mereya Ae Dil Hai Mushkil",
      },
      { title: "Naina", artist: "Arijit Singh", query: "Naina Dangal" },
      { title: "Ae Watan", artist: "Sunidhi Chauhan", query: "Ae Watan Raazi" },
      {
        title: "Muskurane",
        artist: "Arijit Singh",
        query: "Muskurane City Lights",
      },
      {
        title: "Zara Zara Bahekta Hai",
        artist: "JalRaj",
        query: "Zara Zara Bahekta Hai RHTDM",
      },
    ],
  },
  {
    title: "Rediscover Bollywood",
    stats: "8 songs",
    coverQuery: "Ghungroo War Arijit Singh",
    songs: [
      {
        title: "Ghungroo",
        artist: "Arijit Singh, Shilpa Rao",
        query: "Ghungroo War Arijit Singh",
      },
      {
        title: "Bulleya",
        artist: "Amit Mishra, Shilpa Rao",
        query: "Bulleya Ae Dil Hai Mushkil",
      },
      {
        title: "Illahi",
        artist: "Mohit Chauhan",
        query: "Ilahi Yeh Jawaani Hai Deewani",
      },
      {
        title: "Kabhi Kabhi Aditi",
        artist: "Rashid Ali",
        query: "Kabhi Kabhi Aditi Jaane Tu Ya Jaane Na",
      },
      {
        title: "Jeena Jeena",
        artist: "Atif Aslam",
        query: "Jeena Jeena Badlapur",
      },
      {
        title: "Samjhawan",
        artist: "Arijit Singh, Shreya Ghoshal",
        query: "Samjhawan Humpty Sharma Ki Dulhania",
      },
      {
        title: "Tum Hi Ho Bandhu",
        artist: "Amit Trivedi",
        query: "Tum Hi Ho Bandhu Kai Po Che",
      },
      {
        title: "Kaafi Hai Naa",
        artist: "Pritam",
        query: "Kaafi Hai Naa Chhichhore",
      },
    ],
  },
  {
    title: "Late Night Feels",
    stats: "8 songs",
    coverQuery: "Ae Dil Hai Mushkil Arijit Singh",
    songs: [
      {
        title: "Ae Dil Hai Mushkil",
        artist: "Arijit Singh",
        query: "Ae Dil Hai Mushkil Arijit Singh",
      },
      {
        title: "Hawayein",
        artist: "Arijit Singh",
        query: "Hawayein Jab Harry Met Sejal",
      },
      {
        title: "Manwa Laage",
        artist: "Arijit Singh, Shreya Ghoshal",
        query: "Manwa Laage Happy New Year",
      },
      {
        title: "Tum Se Hi",
        artist: "Mohit Chauhan",
        query: "Tum Se Hi Jab We Met",
      },
      {
        title: "Kal Ho Naa Ho",
        artist: "Sonu Nigam",
        query: "Kal Ho Naa Ho title song",
      },
      {
        title: "Tera Ban Jaunga",
        artist: "Akhil Sachdeva, Tulsi Kumar",
        query: "Tera Ban Jaunga Kabir Singh",
      },
      {
        title: "Tujhe Kitna Chahne Lage",
        artist: "Arijit Singh",
        query: "Tujhe Kitna Chahne Lage Kabir Singh",
      },
      {
        title: "Baarish Ki Jaaye",
        artist: "B Praak",
        query: "Barish Ki Jaaye B Praak",
      },
    ],
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
  const [artMap, setArtMap] = useState({});
  const { playSong, nowPlaying, isPlaying } = usePlayer();

  useEffect(() => {
    const allQueries = playlists.flatMap((p) => p.songs.map((s) => s.query));
    allQueries.forEach(async (query) => {
      const url = await fetchAlbumArt(query);
      setArtMap((prev) => ({ ...prev, [query]: url }));
    });
  }, []);

  return (
    <CursorFollow>
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center px-6">
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={22}
            particleColor="#1ed760"
            speed={0.4}
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
            className="font-display text-5xl sm:text-6xl font-semibold leading-[1.05] mb-6 tracking-tight"
          >
            Understand the music
            <br />
            you actually listen to.
          </motion.h1>

          <motion.p
            variants={item}
            className="text-[#a1a1a1] text-base sm:text-lg mb-10 max-w-md mx-auto"
          >
            Your listening history has more stories than Spotify's
            recommendations reveal.
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

      <section className="min-h-screen bg-black text-white relative overflow-hidden px-6 py-24 pb-32">
        <div
          className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full opacity-[0.1] blur-[120px]"
          style={{
            background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-2">
            Made from your history.
          </h2>
          <p className="text-neutral-400 max-w-md mx-auto">
            The kind of playlists that only exist because of what you actually
            listen to.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {playlists.map((playlist, i) => (
            <motion.div
              key={playlist.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="rounded-2xl overflow-hidden bg-neutral-950 border border-white/5"
            >
              <div
                className="relative h-40 p-5 flex flex-col justify-end"
                style={{ backgroundColor: "#3d2b1f" }}
              >
                {artMap[playlist.coverQuery] && (
                  <img
                    src={artMap[playlist.coverQuery]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />

                <div className="relative flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-xl font-semibold">
                      {playlist.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {playlist.stats}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="text-neutral-300 hover:text-white hover:scale-110 transition-all"
                      data-cursor-text="Add"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      className="text-neutral-300 hover:text-white hover:scale-110 transition-all"
                      data-cursor-text="Download"
                    >
                      <Download size={17} />
                    </button>
                    <button
                      className="text-neutral-300 hover:text-white hover:scale-110 transition-all"
                      data-cursor-text="More"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    <button
                      onClick={() =>
                        playSong(
                          playlist.songs[0],
                          artMap[playlist.songs[0].query],
                        )
                      }
                      className="w-10 h-10 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 flex items-center justify-center transition-all"
                      data-cursor-text="Play"
                    >
                      <Play
                        size={16}
                        className="text-black ml-0.5"
                        fill="black"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {playlist.songs.map((song) => {
                  const isActive = nowPlaying?.query === song.query;
                  return (
                    <button
                      key={song.query}
                      onClick={() => playSong(song, artMap[song.query])}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group text-left ${isActive ? "bg-white/5" : ""}`}
                      data-cursor-text="Play"
                    >
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-neutral-800 flex-shrink-0">
                        {artMap[song.query] && (
                          <img
                            src={artMap[song.query]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                        {isActive && isPlaying && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="flex gap-0.5 items-end h-3">
                              <span
                                className="w-0.5 bg-[#1ed760] animate-pulse"
                                style={{ height: "60%" }}
                              />
                              <span
                                className="w-0.5 bg-[#ff4fa3] animate-pulse"
                                style={{
                                  height: "100%",
                                  animationDelay: "0.15s",
                                }}
                              />
                              <span
                                className="w-0.5 bg-[#1ed760] animate-pulse"
                                style={{
                                  height: "40%",
                                  animationDelay: "0.3s",
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm truncate ${isActive ? "text-[#1ed760]" : "text-white"}`}
                        >
                          {song.title}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {song.artist}
                        </p>
                      </div>
                      <MoreHorizontal
                        size={16}
                        className="text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </CursorFollow>
  );
}

export default Landing;
