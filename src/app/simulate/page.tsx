"use client"

import { useState } from "react"
import { Brain } from "lucide-react"
import { toast } from "sonner"

export default function SimulatePage() {
  const [situation, setSituation] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleSimulate() {
    if (!situation.trim()) {
      toast.error("Please describe a situation first")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation })
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        setResult(null)
      } else {
        setResult(data)
      }
    } catch (error) {
      toast.error("Simulation failed")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] text-white">
      <div className="px-5 pt-10 pb-24">
        <div className="mb-2">
          <h1 className="text-xl font-bold text-white mb-1">Ask MirrorMind</h1>
          <p className="text-zinc-500 text-xs">Predict what you'd do based on your past decisions</p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-700 to-purple-900 flex items-center justify-center my-6 shadow-lg shadow-violet-900/40">
          <Brain size={26} color="white" />
        </div>

        <div className="mb-4">
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Describe your situation</label>
          <textarea
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder="e.g. I have an opportunity to start a business with a friend, but I'd have to quit my job..."
            rows={4}
            className="w-full bg-[#13131e] border border-white/8 rounded-xl text-white text-sm px-4 py-3 outline-none focus:border-violet-600 transition-colors placeholder:text-zinc-700 resize-none"
          />
        </div>

        <button
          onClick={handleSimulate}
          disabled={!situation.trim() || loading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl text-sm transition-all mb-6 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Thinking...
            </>
          ) : "What would I do?"}
        </button>

        {result && (
          <div className="bg-[#13131e] border border-violet-700/40 rounded-2xl p-5 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-violet-500"/>
              <p className="text-violet-400 text-xs font-semibold tracking-widest uppercase">Prediction</p>
            </div>

            <p className="text-white text-lg font-bold mb-1">{result.predictedChoice}</p>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${result.basedOn > 0 ? 85 : 0}%` }}/>
              </div>
              <span className="text-violet-400 text-xs font-bold">{result.confidence}</span>
            </div>

            <div className="border-t border-white/6 pt-4">
              <p className="text-zinc-500 text-xs font-medium mb-1">Most similar past decision</p>
              <p className="text-zinc-300 text-sm font-medium mb-2">→ {result.matchedDecision || "No matches"}</p>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Found {result.basedOn} relevant decisions in your archive.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
