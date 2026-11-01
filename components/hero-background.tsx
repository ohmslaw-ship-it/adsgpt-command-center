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
            "linear-gradient(to bottom, #E9ECFF 0%, #F1E9FF 42%, #FFE6E3 72%, #FFFFFF 100%)",
        }}
      />

      <div className="hero-blob hero-blob--lavender absolute -left-[12%] -top-[8%] h-[min(520px,55vw)] w-[min(520px,55vw)] rounded-full bg-[#B8A9FE] opacity-[0.42] blur-[100px]" />
      <div className="hero-blob hero-blob--periwinkle absolute -right-[10%] -top-[6%] h-[min(480px,50vw)] w-[min(480px,50vw)] rounded-full bg-[#AFC3FF] opacity-[0.4] blur-[100px]" />
      <div className="hero-blob hero-blob--coral absolute -bottom-[14%] -right-[6%] h-[min(440px,48vw)] w-[min(440px,48vw)] rounded-full bg-[#FF9CA3] opacity-[0.38] blur-[100px]" />
      <div className="hero-blob hero-blob--saffron absolute -bottom-[10%] -left-[8%] h-[min(400px,45vw)] w-[min(400px,45vw)] rounded-full bg-[#FEC530] opacity-25 blur-[100px]" />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.06] mix-blend-soft-light"
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

      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-white" />
    </div>
  );
}
