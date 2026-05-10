"use client"

import { useEffect, useState } from "react"
import { Plus, Brain } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

const catColors: Record<string, string> = {
  work: "bg-violet-900/50 text-violet-300",
  personal: "bg-blue-900/50 text-blue-300",
  finance: "bg-emerald-900/50 text-emerald-300",
  health: "bg-pink-900/50 text-pink-300",
  other: "bg-zinc-800 text-zinc-400",
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, avgConfidence: 0, goodOutcomes: 0 })
  const [recentDecisions, setRecentDecisions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/decisions")
        const data = await res.json()
        if (Array.isArray(data)) {
          setRecentDecisions(data.slice(0, 3))
          
          const total = data.length
          const avgConfidence = total ? Math.round(data.reduce((acc: number, d: any) => acc + d.confidence, 0) / total) : 0
          const goodOutcomes = data.filter((d: any) => d.outcome === "good").length
          
          setStats({ total, avgConfidence, goodOutcomes })
        } else {
          setRecentDecisions([])
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] text-white">
      <div className="flex-1 px-5 pt-10 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-zinc-500 text-xs font-medium mb-0.5">Good morning,</p>
            <h1 className="text-xl font-bold text-white">{session?.user?.name || "Explorer"} 👋</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-violet-700 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-900/30 border border-white/10">
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "EX"}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Total Decisions</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-violet-400 text-xs mt-1">+3 this week</p>
          </div>
          <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Confidence Score</p>
            <p className="text-3xl font-bold text-white">{stats.avgConfidence}<span className="text-base text-zinc-500">%</span></p>
            <p className="text-emerald-400 text-xs mt-1">↑ 4% this month</p>
          </div>
        </div>

        {/* Ask CTA */}
        <Link href="/simulate">
          <button className="w-full bg-gradient-to-r from-violet-700 to-purple-800 rounded-2xl p-4 mb-6 text-left border border-violet-500/20 shadow-lg shadow-violet-900/30 group">
            <p className="text-violet-300 text-xs font-medium mb-1 flex items-center gap-1.5">
              <Brain size={12} /> AI Simulation
            </p>
            <p className="text-white font-semibold text-sm">Ask MirrorMind →</p>
            <p className="text-zinc-400 text-xs mt-0.5">Predict what you'd do next</p>
          </button>
        </Link>

        {/* Recent */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Recent Decisions</h2>
          <Link href="/decisions" className="text-violet-400 text-xs font-medium hover:underline">See all</Link>
        </div>
        
        <div className="flex flex-col gap-3">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)
          ) : recentDecisions.length > 0 ? (
            recentDecisions.map((d) => (
              <Link href={`/decisions?id=${d.id}`} key={d.id}>
                <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 text-left w-full hover:border-violet-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm font-medium leading-snug flex-1">{d.title}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${catColors[d.category] || "bg-zinc-800 text-zinc-400"}`}>
                      {d.category}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-1.5 line-clamp-1">{d.choice}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex-1 h-1 bg-white/6 rounded-full overflow-hidden mr-3">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${d.confidence}%` }}/>
                    </div>
                    <span className="text-zinc-600 text-xs font-mono">{d.confidence}%</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-10 bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
              <p className="text-zinc-500 text-sm">No decisions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <Link href="/add">
        <button className="fixed bottom-24 right-8 w-14 h-14 bg-violet-600 hover:bg-violet-500 rounded-full flex items-center justify-center shadow-xl shadow-violet-900/60 transition-colors z-30">
          <Plus size={24} color="white" strokeWidth={3} />
        </button>
      </Link>
    </div>
  )
}
