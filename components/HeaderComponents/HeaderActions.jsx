"use client";

import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { LayoutDashboard, Sparkles, Menu, Zap, CreditCard } from "lucide-react";
import Link from "next/link";

export default function HeaderActions({ dbUser }) {
  // dbUser comes from the server. It might be null if not logged in.
  
  return (
    <div className="flex items-center gap-4">
      {/* --- AUTHENTICATED STATE --- */}
      <SignedIn>
        {/* Credits Badge (Desktop Only) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
            <Zap className="w-3 h-3 fill-blue-400" />
            <span>{dbUser?.credits || 0} Credits</span>
        </div>

        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-300 hover:text-white hover:bg-white/10">
            Dashboard
          </Button>
        </Link>
        
        <Link href="/dashboard/scan">
            <Button size="sm" className="hidden sm:flex bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 border-0">
            <Sparkles className="w-4 h-4 mr-2" />
            New Scan
            </Button>
        </Link>
        
        <div className="pl-2 border-l border-white/10">
            <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>

      {/* --- GUEST STATE --- */}
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
            Sign In
          </Button>
        </SignInButton>
        
        <SignInButton mode="modal">
          <Button className="bg-white text-black hover:bg-slate-200 transition-colors font-semibold">
            Get Started
          </Button>
        </SignInButton>
      </SignedOut>

      {/* --- MOBILE MENU (Sheet) --- */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-slate-950 border-white/10 text-slate-200">
            <SheetHeader>
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col gap-4 mt-8">
               <SignedIn>
                  {/* Mobile User Info */}
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
                    <p className="text-sm font-medium text-white">Welcome, {dbUser?.firstName || "User"}</p>
                    <p className="text-xs text-slate-400">{dbUser?.email}</p>
                    <div className="mt-3 flex items-center gap-2 text-blue-400 text-xs font-semibold">
                        <Zap className="w-3 h-3" />
                        {dbUser?.credits || 0} Credits Available
                    </div>
                  </div>

                  <SheetClose asChild>
                    <Link href="/dashboard" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md text-slate-300 hover:text-white transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/scan" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md text-blue-400 hover:text-blue-300 transition-colors">
                        <Sparkles className="w-5 h-5" />
                        New AI Scan
                    </Link>
                  </SheetClose>
               </SignedIn>

               <SheetClose asChild>
                  <Link href="/features" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md text-slate-300 hover:text-white">
                      Features
                  </Link>
               </SheetClose>
               <SheetClose asChild>
                  <Link href="/pricing" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md text-slate-300 hover:text-white">
                      <CreditCard className="w-5 h-5" />
                      Pricing
                  </Link>
               </SheetClose>
               <SheetClose asChild>
                  <Link href="/dashboard/payments" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md text-slate-300 hover:text-white">
                      <CreditCard className="w-5 h-5" />
                      Old Payments
                  </Link>
               </SheetClose>

               <SignedOut>
                    <SignInButton>
                        <Button className="w-full mt-4 bg-blue-600 text-white">Sign In</Button>
                    </SignInButton>
               </SignedOut>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}