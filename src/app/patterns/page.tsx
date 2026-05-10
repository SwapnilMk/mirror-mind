"use client"

import { useEffect, useState } from "react"

export default function PatternsPage() {
  const [decisions, setDecisions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/decisions")
        const data = await res.json()
        if (Array.isArray(data)) {
          setDecisions(data)
        } else {
          setDecisions([])
        }
      } catch (error) {
        console.error("Failed to fetch patterns data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Derived stats
  const catStats = decisions.reduce((acc: any, d: any) => {
    acc[d.category] = (acc[d.category] || 0) + 1
    return acc
  }, {})

  const total = decisions.length
  const max = Math.max(...Object.values(catStats) as number[], 1)

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] text-white">
      <div className="px-5 pt-10 pb-24">
        <h1 className="text-xl font-bold text-white mb-1">Patterns</h1>
        <p className="text-zinc-500 text-xs mb-6">Based on your {total} decisions</p>

        {/* Risk style (Mocked for now as it's derived logic) */}
        <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 mb-3">
          <p className="text-zinc-500 text-xs font-medium mb-1">Risk Style</p>
          <p className="text-white font-semibold text-base mb-1">Balanced Explorer</p>
          <p className="text-zinc-500 text-xs leading-relaxed">You tend to weigh options carefully but aren't afraid to take calculated risks when confidence is above 75%.</p>
        </div>

        {/* Speed */}
        <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 mb-3">
          <p className="text-zinc-500 text-xs font-medium mb-1">Decision Speed</p>
          <div className="flex items-center gap-3 mb-1">
            <p className="text-white font-semibold text-base">Consistent</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`w-5 h-1.5 rounded-full ${i <= 3 ? "bg-violet-500" : "bg-zinc-800"}`}/>
              ))}
            </div>
          </div>
          <p className="text-zinc-500 text-xs leading-relaxed">Your average reflection time has stabilized over the last 10 entries.</p>
        </div>

        {/* Trust vs Logic */}
        <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 mb-3">
          <p className="text-zinc-500 text-xs font-medium mb-3">Trust vs Logic</p>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-zinc-600 text-xs w-10 text-right">Feel</span>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                style={{ width: `65%` }}
              />
            </div>
            <span className="text-zinc-600 text-xs w-10">Logic</span>
          </div>
          <p className="text-center text-violet-400 text-xs font-medium">Logically Leaning (65%)</p>
        </div>

        {/* Categories */}
        <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 pb-24">
          <p className="text-zinc-500 text-xs font-medium mb-4">Decisions by Category</p>
          <div className="flex flex-col gap-3">
            {Object.entries(catStats).map(([name, count]: [string, any]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-zinc-400 text-xs w-20 capitalize">{name}</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{ width: `${Math.round(count / max * 100)}%` }}
                  />
                </div>
                <span className="text-zinc-600 text-xs w-4 text-right">{count}</span>
              </div>
            ))}
            {total === 0 && <p className="text-zinc-600 text-xs italic">No category data yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
