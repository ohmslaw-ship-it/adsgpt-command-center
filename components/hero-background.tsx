export function HeroBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #E9ECFF 0%, #F1E9FF 42%, #FFE6E3 72%, #FFF5F8 86%, #FFFBFC 94%)",
        }}
      />

      <div className="ambient-lavender-glow absolute -left-[18%] top-[8%] h-[min(620px,72vw)] w-[min(620px,72vw)] opacity-[0.28]" />
      <div className="ambient-lavender-glow absolute -right-[14%] top-[22%] h-[min(540px,65vw)] w-[min(540px,65vw)] bg-[#D8CCFA] opacity-[0.32]" />

      <div className="hero-dot-grid absolute inset-0" />

      <div className="hero-blob hero-blob--coral absolute -bottom-[14%] -right-[6%] h-[min(440px,48vw)] w-[min(440px,48vw)] rounded-full bg-[#FF9CA3] opacity-[0.22] blur-[100px]" />
      <div className="hero-blob hero-blob--saffron absolute -bottom-[10%] -left-[8%] h-[min(400px,45vw)] w-[min(400px,45vw)] rounded-full bg-[#FEC530] opacity-[0.14] blur-[100px]" />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-soft-light"
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
        className="absolute inset-x-0 bottom-0 h-[160px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 35%, rgba(255,255,255,0.85) 70%, #ffffff 100%)",
        }}
      />
    </div>
  );
}
