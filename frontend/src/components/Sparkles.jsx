import { useCallback, useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

function SparklesCore({
  background = "transparent",
  minSize = 0.6,
  maxSize = 1.4,
  particleDensity = 100,
  className = "",
  particleColor = "#1ed760",
  speed = 1,
}) {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo(
    () => ({
      background: { color: { value: background } },
      fullScreen: { enable: false, zIndex: 0 },
      fpsLimit: 120,
      particles: {
        color: { value: particleColor },
        move: {
          enable: true,
          speed: { min: 0.1, max: speed },
          direction: "none",
          random: false,
          straight: false,
          outModes: { default: "out" },
        },
        number: {
          density: { enable: true, width: 400, height: 400 },
          value: particleDensity,
        },
        opacity: {
          value: { min: 0.1, max: 1 },
          animation: {
            enable: true,
            speed: speed * 2,
            sync: false,
            startValue: "random",
          },
        },
        size: { value: { min: minSize, max: maxSize } },
      },
      detectRetina: true,
    }),
    [background, particleColor, particleDensity, minSize, maxSize, speed],
  );

  return (
    <ParticlesProvider init={particlesInit}>
      <Particles id="tsparticles" className={className} options={options} />
    </ParticlesProvider>
  );
}

export default SparklesCore;
