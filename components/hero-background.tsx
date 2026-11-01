export function HeroBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to bottom, #E9ECFF 0%, #F1E9FF 42%, #FFE6E3 72%, #FFF5F8 86%, #FFFBFC 94%)",
        }}
      />

      <div
        className="hero-dot-grid absolute inset-0 z-[1]"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 35%, black 40%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 35%, black 40%, transparent 100%)",
        }}
      />

      <div className="hero-blob hero-blob--coral absolute -bottom-[14%] -right-[6%] z-[2] h-[min(440px,48vw)] w-[min(440px,48vw)] rounded-full bg-[#FF9CA3] opacity-[0.22] blur-[100px]" />
      <div className="hero-blob hero-blob--saffron absolute -bottom-[10%] -left-[8%] z-[2] h-[min(400px,45vw)] w-[min(400px,45vw)] rounded-full bg-[#FEC530] opacity-[0.14] blur-[100px]" />

      <svg
        className="absolute inset-0 z-[2] h-full w-full opacity-[0.05] mix-blend-soft-light"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <filter id="hero-grain-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain-noise)" />
      </svg>

      <div
        className="absolute inset-x-0 bottom-0 z-[2] h-[160px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 35%, rgba(255,255,255,0.85) 70%, #ffffff 100%)",
        }}
      />
    </div>
  );
}
