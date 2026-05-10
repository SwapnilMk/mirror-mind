"use client"

import Link from "next/link"
import { Brain } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080810] px-6 pb-24">
      <div className="mb-8 relative">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center shadow-2xl shadow-violet-900/60">
          <Brain size={38} color="white" strokeWidth={1.5} />
        </div>
        <div className="absolute -inset-2 rounded-3xl bg-violet-500/20 blur-xl -z-10"/>
      </div>
      <h1 className="text-4xl font-bold text-white tracking-tight mb-2">MirrorMind</h1>
      <p className="text-zinc-500 text-sm tracking-widest uppercase mb-16">Your Thinking. Your Twin.</p>
      
      <Link href="/dashboard" className="w-full">
        <button
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-4 rounded-2xl text-sm transition-colors shadow-lg shadow-violet-900/50"
        >
          Get Started
        </button>
      </Link>
      
      <p className="text-zinc-600 text-xs mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-violet-400 font-medium">Sign in</Link>
      </p>
    </div>
  );
}
