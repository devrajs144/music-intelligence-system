import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Music, Fingerprint, Clock, Radar } from "lucide-react";
import { AnimatedBeam } from "./ui/animated-beam";
import { OrbitingCircles } from "./ui/orbiting-circles";

gsap.registerPlugin(ScrollTrigger);

function Node({ innerRef, children, className = "" }) {
  return (
    <div
      ref={innerRef}
      className={`z-10 flex size-14 items-center justify-center rounded-full border border-white/10 bg-neutral-900 ${className}`}
    >
      {children}
    </div>
  );
}

function HowItWorks() {
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const spotifyRef = useRef(null);
  const dnaRef = useRef(null);
  const memoryRef = useRef(null);
  const bubbleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".how-it-works-heading", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });

      gsap.from(".beam-diagram", {
        opacity: 0,
        scale: 0.9,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-24"
    >
      <h2 className="how-it-works-heading font-display text-3xl sm:text-4xl font-semibold mb-16 text-center">
        One connection.
        <br />
        Three ways to understand your music.
      </h2>

      <div
        ref={containerRef}
        className="beam-diagram relative flex w-full max-w-2xl h-[320px] items-center justify-center"
      >
        <OrbitingCircles
          radius={140}
          duration={25}
          path={false}
          iconSize={0}
          className="opacity-0"
        >
          <div />
        </OrbitingCircles>

        <div className="flex w-full items-center justify-between">
          <Node innerRef={spotifyRef} className="border-[#1ed760]/40">
            <Music size={22} className="text-[#1ed760]" />
          </Node>

          <div className="flex flex-col gap-10">
            <Node innerRef={dnaRef}>
              <Fingerprint size={20} className="text-neutral-300" />
            </Node>
            <Node innerRef={memoryRef}>
              <Clock size={20} className="text-neutral-300" />
            </Node>
            <Node innerRef={bubbleRef}>
              <Radar size={20} className="text-neutral-300" />
            </Node>
          </div>
        </div>

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={spotifyRef}
          toRef={dnaRef}
          curvature={-40}
          pathColor="#1ed760"
          pathOpacity={0.15}
          gradientStartColor="#1ed760"
          gradientStopColor="#1ed760"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={spotifyRef}
          toRef={memoryRef}
          pathColor="#1ed760"
          pathOpacity={0.15}
          gradientStartColor="#1ed760"
          gradientStopColor="#1ed760"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={spotifyRef}
          toRef={bubbleRef}
          curvature={40}
          pathColor="#1ed760"
          pathOpacity={0.15}
          gradientStartColor="#1ed760"
          gradientStopColor="#1ed760"
        />
      </div>

      <div className="flex gap-16 mt-8 text-sm text-neutral-400">
        <span>Music DNA</span>
        <span>Rediscover</span>
        <span>Your Bubble</span>
      </div>
    </section>
  );
}

export default HowItWorks;
