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

      {/* --- DASHBOARD PREVIEW IMAGE --- */}
      {/* This creates a nice tilted 3D preview effect at the bottom */}
      <div className="relative z-10 mt-16 mx-auto max-w-5xl px-4 perspective-[2000px]">
        <div className="relative rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm shadow-2xl transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out p-2">
            
            {/* Fake Browser Header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/5 rounded-t-lg">
                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
            </div>

            {/* Placeholder for Dashboard Screenshot */}
            {/* Once you take a screenshot of your finished dashboard, replace this div with an <Image /> */}
            <div className="aspect-video w-full bg-slate-950 rounded-b-lg flex items-center justify-center relative overflow-hidden group">
                {/* Simulated Content */}
                <div className="absolute inset-0 bg-linear-to-tr from-slate-900 via-slate-800 to-slate-900"></div>
                <div className="relative z-10 text-slate-500 text-sm font-mono flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                    <p className="animate-pulse">AI System Analyzing Maintenance Logs...</p>
                </div>
                
                {/* Scan Line Animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-scan-down"></div>
            </div>
        </div>
      </div>

    </section>
  );
}