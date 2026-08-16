import { motion } from "motion/react";
import {
  Sparkles as SparklesIcon,
  Clock,
  Radar,
  Fingerprint,
} from "lucide-react";
import SparklesCore from "../components/Sparkles";
import ScrambleText from '../components/ScrambleText'

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

function Landing() {
  const features = [
    { icon: Fingerprint, label: "Music DNA" },
    { icon: Clock, label: "Rediscover forgotten songs" },
    { icon: Radar, label: "Explore your bubble" },
  ];

  return (
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
        >
          <SparklesIcon size={12} className="text-[#1ed760]" />
          Personal music intelligence, powered by your own data
        </motion.div>

        <motion.h1 variants={item} className="font-display text-4xl sm:text-5xl font-semibold leading-tight mb-5">
          <ScrambleText text="Understand the music" delay={0.3} />
          <br />
          <ScrambleText text="you actually listen to." delay={0.7} />
        </motion.h1>

        <motion.p
          variants={item}
          className="text-neutral-400 text-base sm:text-lg mb-10 max-w-lg mx-auto"
        >
          Rediscover forgotten favorites, see how far your listening bubble
          really extends, and get a behavioural profile built entirely from your
          own Spotify history.
        </motion.p>

        <motion.a
          variants={item}
          href="http://127.0.0.1:8000/auth/login"
          className="inline-block bg-[#1ed760] hover:bg-[#1fdf64] text-black font-semibold px-7 py-3.5 rounded-full transition-colors duration-200 shadow-[0_0_40px_-10px_#1ed760]"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Connect Spotify
        </motion.a>

        <motion.div
          variants={item}
          className="flex items-center justify-center gap-8 mt-14 text-neutral-500"
        >
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon size={18} strokeWidth={1.5} />
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Landing;
