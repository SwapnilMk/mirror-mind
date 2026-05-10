"use client"

import { useEffect, useState } from "react"
import { Bell, Shield, LogOut, ChevronRight, Download, HelpCircle } from "lucide-react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

export default function ProfilePage() {
  const [stats, setStats] = useState({ total: 0, good: 0, avgConfidence: 0 })
  const [showLogout, setShowLogout] = useState(false)

  const { data: session } = useSession()

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/decisions")
        const data = await res.json()
        if (Array.isArray(data)) {
          const total = data.length
          const good = data.filter((d: any) => d.outcome === "good").length
          const avgConfidence = total ? Math.round(data.reduce((acc: number, d: any) => acc + d.confidence, 0) / total) : 0
          setStats({ total, good, avgConfidence })
        }
      } catch (error) {
        console.error("Failed to fetch profile data", error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] text-white">
      <div className="px-5 pt-10 pb-24">
        <h1 className="text-xl font-bold text-white mb-6">Profile</h1>

        {/* Avatar + Info */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg shadow-violet-900/40">
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "EX"}
          </div>
          <h2 className="text-white text-lg font-bold">{session?.user?.name || "Explorer"}</h2>
          <p className="text-zinc-500 text-sm">{session?.user?.email || "explorer@mirrormind.ai"}</p>
          <div className="mt-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-700/40">
            <p className="text-violet-300 text-xs font-medium">Pro Member</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#13131e] border border-white/6 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-zinc-600 text-[10px] uppercase tracking-wider mt-0.5">Total</p>
          </div>
          <div className="bg-[#13131e] border border-white/6 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.good}</p>
            <p className="text-zinc-600 text-[10px] uppercase tracking-wider mt-0.5">Good</p>
          </div>
          <div className="bg-[#13131e] border border-white/6 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-violet-400">{stats.avgConfidence}%</p>
            <p className="text-zinc-600 text-[10px] uppercase tracking-wider mt-0.5">Conf.</p>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-[#13131e] border border-white/6 rounded-2xl overflow-hidden mb-4">
          {[
            { label: "Notifications", icon: Bell },
            { label: "Export Decisions", icon: Download },
            { label: "Privacy & Security", icon: Shield },
            { label: "Help & Support", icon: HelpCircle },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-3 px-4 py-4 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors group text-left">
              <item.icon size={18} className="text-zinc-500 group-hover:text-violet-400 transition-colors" />
              <span className="text-zinc-300 text-sm flex-1">{item.label}</span>
              <ChevronRight size={16} className="text-zinc-700" />
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowLogout(true)}
          className="w-full bg-red-900/10 border border-red-900/20 hover:bg-red-900/20 hover:border-red-900/40 text-red-400 font-semibold py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>

      {/* Logout modal */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-[100] px-4 pb-10">
          <div className="bg-[#1a1a27] border border-white/10 rounded-[32px] p-6 w-full max-w-sm animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
            <h3 className="text-white font-bold text-xl mb-2 text-center">Log Out?</h3>
            <p className="text-zinc-500 text-sm text-center mb-8">You'll need to sign back in to access your decisions archive.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl text-sm transition-colors"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setShowLogout(false)}
                className="w-full bg-[#13131e] border border-white/8 text-zinc-300 font-bold py-4 rounded-2xl text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
