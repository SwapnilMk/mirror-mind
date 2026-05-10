"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import Link from "next/link"

const catColors: Record<string, string> = {
  work: "bg-violet-900/50 text-violet-300",
  personal: "bg-blue-900/50 text-blue-300",
  finance: "bg-emerald-900/50 text-emerald-300",
  health: "bg-pink-900/50 text-pink-300",
};

export default function HistoryPage() {
  const [decisions, setDecisions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const query = new URLSearchParams()
        if (search) query.set("search", search)
        
        const res = await fetch(`/api/decisions?${query.toString()}`)
        const data = await res.json()
        if (Array.isArray(data)) {
          setDecisions(data)
        } else {
          setDecisions([])
        }
      } catch (error) {
        console.error("Failed to fetch decisions", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [search])

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] text-white">
      <div className="px-5 pt-10 pb-24">
        <h1 className="text-xl font-bold text-white mb-5">Decision History</h1>

        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search decisions..."
            className="w-full bg-[#13131e] border border-white/8 rounded-xl text-white text-sm pl-10 pr-4 py-3 outline-none focus:border-violet-600 transition-colors placeholder:text-zinc-700"
          />
        </div>

        <div className="flex flex-col gap-3 pb-20">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />)
          ) : decisions.length > 0 ? (
            decisions.map(d => (
              <Link href={`/decisions?id=${d.id}`} key={d.id}>
                <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 text-left w-full hover:border-violet-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white text-sm font-medium leading-snug flex-1">{d.title}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${catColors[d.category] || "bg-zinc-800 text-zinc-400"}`}>
                      {d.category}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs mb-2">→ {d.choice}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-700 text-[10px]">{new Date(d.createdAt).toLocaleDateString()}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      d.outcome === "good" ? "text-emerald-400" : 
                      d.outcome === "bad" ? "text-rose-400" : 
                      "text-amber-500"
                    }`}>
                      {d.outcome}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-zinc-600 text-sm text-center py-10">No decisions found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
