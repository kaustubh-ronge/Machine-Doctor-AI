import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Machine Health AI",
  description: "AI-Powered Preventive Maintenance",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: "#3b82f6" },
      }}
    >
      <html lang="en" className="dark h-full" suppressHydrationWarning>
        <body suppressHydrationWarning className={`${inter.className} h-full antialiased text-slate-200 selection:bg-blue-500/30`}>
          
          {/* --- FIXED FULL SCREEN BACKGROUND --- */}
          <div className="fixed inset-0 -z-10 h-full w-full bg-slate-950">
             {/* Smooth Main Gradient: Deep dark base with a blue glow from the top center */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e3a8a36,rgba(255,255,255,0))]" />
            
            {/* Secondary Accent: Subtle purple/cyan hint for depth */}
            <div className="absolute top-0  right-[-10%] h-125 w-125 rounded-full bg-blue-500/5 blur-[100px]" />
            <div className="absolute bottom-0 left-[-10%] h-125 w-125 rounded-full bg-cyan-500/5 blur-[100px]" />
          </div>

          {/* Content Wrapper */}
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
          
        </body>
      </html>
    </ClerkProvider>
  );
}