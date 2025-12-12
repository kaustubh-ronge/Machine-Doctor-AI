
import Link from "next/link";
import HeaderActions from "./HeaderActions";
import { Activity } from "lucide-react";
import { checkUser } from "@/lib/checkUser"; 

export default async function Header() {
  const dbUser = await checkUser();

  return (
    <header className="px-6 sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* --- LOGO --- */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-linear-to-tr from-blue-600 to-cyan-500 rounded-lg shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Machine<span className="text-blue-500">Doctor</span>
            </span>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          {/* UPDATED: Changed 'md:flex' to 'xl:flex' so links hide on smaller laptops */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-400">
            <Link href="/dashboard" className="hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/features" className="hover:text-blue-400 transition-colors">
              Features
            </Link>
            <Link href="/dashboard/reports" className="hover:text-blue-400 transition-colors">
              Reports
            </Link>
            <Link href="/pricing" className="hover:text-blue-400 transition-colors">
              Pricing
            </Link>
            <Link href="/dashboard/payments" className="hover:text-blue-400 transition-colors">
              Past Payments
            </Link>
          </nav>
        </div>

        {/* --- ACTIONS (Client Side) --- */}
        <HeaderActions dbUser={dbUser} />
      </div>
    </header>
  );
}