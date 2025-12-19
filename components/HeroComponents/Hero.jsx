import HeroClient from "./HeroClient";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-64px)] flex flex-col justify-start overflow-hidden">
      
      {/* --- BACKGROUND EFFECTS (Server Side Rendered for Speed) --- */}
      
      {/* 1. The Grid Floor */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* 2. The Glowing Orb effect at the bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-blue-600/20 opacity-50 blur-[100px] rounded-full pointer-events-none"></div>

      {/* --- CONTENT --- */}
      <HeroClient />

      
      {/* </div> */}

    </section>
  );
}