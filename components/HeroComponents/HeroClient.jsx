"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HeroClient() {
  return (
    <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto mt-20 px-4">
      
      {/* 1. The "New Feature" Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400 mb-8"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span className="font-medium">AI Engine v2.0 Live</span>
      </motion.div>

      {/* 2. Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6"
      >
        Predict Machine <br className="hidden sm:block" />
        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-400 to-blue-400 animate-gradient-x">
          Failures Before They Happen
        </span>
      </motion.h1>

      {/* 3. Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed"
      >
        Upload your maintenance invoices, service reports, or logs. Our AI analyzes the history to predict breakdowns and suggest preventive actions instantly.
      </motion.p>

      {/* 4. CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
      >
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto h-12 text-base px-8 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] border-0">
            <Sparkles className="mr-2 h-4 w-4 fill-white" />
            Start Free AI Scan
          </Button>
        </Link>
        
        <Link href="/demo" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 text-base px-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
            <FileText className="mr-2 h-4 w-4" />
            View Sample Report
          </Button>
        </Link>
      </motion.div>

      {/* 5. Trust / Social Proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-16 pt-8 border-t border-white/5 w-full max-w-sm sm:max-w-md"
      >
        <p className="text-sm text-slate-500 mb-4">TRUSTED BY ENGINEERS AT</p>
        <div className="flex justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           {/* Placeholders for logos - you can replace with real SVGs later */}
           <div className="h-6 w-20 bg-slate-600/30 rounded"></div>
           <div className="h-6 w-20 bg-slate-600/30 rounded"></div>
           <div className="h-6 w-20 bg-slate-600/30 rounded"></div>
        </div>
      </motion.div>

    </div>
  );
}