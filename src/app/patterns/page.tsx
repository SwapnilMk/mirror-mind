"use client"

import { useEffect, useState } from "react"
import { 
  Brain, 
  AlertCircle, 
  Sparkles, 
  Activity, 
  History, 
  Heart, 
  ChevronRight, 
  ShieldAlert, 
  Zap, 
  Frown, 
  Compass, 
  ThumbsUp
} from "lucide-react"
import Link from "next/link"

const catColors: Record<string, string> = {
  work: "bg-violet-900/50 text-violet-300 border-violet-500/25",
  finance: "bg-emerald-900/50 text-emerald-300 border-emerald-500/25",
  lifestyle: "bg-blue-900/50 text-blue-300 border-blue-500/25",
  health: "bg-pink-900/50 text-pink-300 border-pink-500/25",
  relationships: "bg-red-900/50 text-red-300 border-red-500/25",
  other: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

export default function PatternsPage() {
  const [decisions, setDecisions] = useState<any[]>([])
  const [patternsData, setPatternsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile") // "profile" | "shadows" | "timeline" | "emotions"

  useEffect(() => {
    async function fetchData() {
      try {
        const [decisionsRes, patternsRes] = await Promise.all([
          fetch("/api/decisions"),
          fetch("/api/patterns")
        ])
        const [decisionsData, patData] = await Promise.all([
          decisionsRes.json(),
          patternsRes.json()
        ])
        if (Array.isArray(decisionsData)) {
          setDecisions(decisionsData)
        }
        if (patData && !patData.error) {
          setPatternsData(patData)
        }
      } catch (error) {
        console.error("Failed to fetch patterns data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Derived Statistics for Profiles/Analytics
  const total = decisions.length
  
  const catStats = decisions.reduce((acc: any, d: any) => {
    acc[d.category] = (acc[d.category] || 0) + 1
    return acc
  }, {})

  const maxCatCount = Math.max(...Object.values(catStats) as number[], 1)

  // Stress stats
  const goodDecisions = decisions.filter(d => d.outcome === "good")
  const badDecisions = decisions.filter(d => d.outcome === "bad")
  
  const avgGoodStress = goodDecisions.length 
    ? (goodDecisions.reduce((sum, d) => sum + (d.stressLevel || 5), 0) / goodDecisions.length).toFixed(1)
    : "5.0"
  const avgBadStress = badDecisions.length 
    ? (badDecisions.reduce((sum, d) => sum + (d.stressLevel || 5), 0) / badDecisions.length).toFixed(1)
    : "5.0"

  // Regret stats
  const catRegretStats = decisions.reduce((acc: any, d: any) => {
    if (d.outcome !== "pending" && d.regretScore !== undefined) {
      if (!acc[d.category]) acc[d.category] = { sum: 0, count: 0 }
      acc[d.category].sum += d.regretScore
      acc[d.category].count += 1
    }
    return acc
  }, {})

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] text-white">
      <div className="px-5 pt-10 pb-24">
        <h1 className="text-xl font-bold text-white mb-1">Patterns</h1>
        <p className="text-zinc-500 text-xs mb-5">
          Deep behavioral diagnostics based on {total} decision logs
        </p>

        {/* Tab Selection */}
        <div className="flex bg-[#13131e] border border-white/6 p-1 rounded-2xl mb-6 select-none overflow-x-auto whitespace-nowrap scrollbar-none gap-1">
          {[
            { id: "profile", label: "Profile", icon: Brain },
            { id: "shadows", label: "Contradictions", icon: ShieldAlert },
            { id: "timeline", label: "Decision Map", icon: History },
            { id: "emotions", label: "Emotional Health", icon: Heart }
          ].map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === t.id
                    ? "bg-violet-600 text-white shadow-md shadow-violet-950/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/3"
                }`}
              >
                <Icon size={14} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-white/3 animate-pulse border border-white/4 flex items-center justify-center text-zinc-600 text-xs">
                Syncing behavioral memory...
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-20">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <>
                {/* Risk style */}
                <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Compass size={16} className="text-violet-400" />
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Risk Profile Style</p>
                  </div>
                  <p className="text-white font-bold text-base mb-1">
                    {patternsData?.riskStyle || "Balanced Explorer"}
                  </p>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {patternsData?.riskDesc || "Add more decisions to unlock personalized risk assessments."}
                  </p>
                </div>

                {/* Speed */}
                <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={15} className="text-violet-400" />
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Deliberation Speed</p>
                  </div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="text-white font-bold text-base">{patternsData?.decisionSpeed || "Consistent"}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-4 h-1.5 rounded-full ${i <= (patternsData?.decisionSpeedValue || 3) ? "bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.3)]" : "bg-zinc-800"}`}/>
                      ))}
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {patternsData?.speedDesc || "Deliberation speed index compiles over time."}
                  </p>
                </div>

                {/* Trust vs Logic */}
                <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity size={15} className="text-violet-400" />
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Intuition vs. Logic</p>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold w-12 text-right">Feel</span>
                    <div className="flex-1 h-2 bg-zinc-800/80 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${patternsData?.trustVsLogic ?? 50}%` }}
                      />
                    </div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold w-12 text-left">Logic</span>
                  </div>
                  <p className="text-center text-violet-400 text-xs font-semibold">
                    {patternsData?.trustVsLogicText || "Highly Balanced (50%)"}
                  </p>
                </div>

                {/* Core Patterns */}
                {patternsData?.behavioralPatterns && patternsData.behavioralPatterns.length > 0 ? (
                  <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4">
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-4 border-b border-white/6 pb-2">
                      Core Behavioral Insights
                    </p>
                    <div className="flex flex-col gap-4">
                      {patternsData.behavioralPatterns.map((p: any, idx: number) => (
                        <div key={idx} className="border-b border-white/5 last:border-0 pb-3 last:pb-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_#a78bfa]" />
                            <p className="text-white text-xs font-semibold">{p.title}</p>
                          </div>
                          <p className="text-zinc-400 text-xs leading-relaxed mb-1.5">{p.desc}</p>
                          <div className="bg-[#191927] border border-white/4 p-2 rounded-lg text-[10px] text-zinc-500 font-medium italic">
                            Recommendation: {p.impact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#13131e] border border-white/6 rounded-2xl p-6 text-center text-zinc-500 text-xs">
                    Need more decision context to run pattern models.
                  </div>
                )}

                {/* Category breakdown */}
                <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4">
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-4">Decisions by Category</p>
                  <div className="flex flex-col gap-3">
                    {Object.entries(catStats).map(([name, count]: [string, any]) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="text-zinc-400 text-xs w-20 capitalize font-medium">{name}</span>
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all"
                            style={{ width: `${Math.round(count / maxCatCount * 100)}%` }}
                          />
                        </div>
                        <span className="text-zinc-500 text-xs w-4 text-right font-mono font-bold">{count}</span>
                      </div>
                    ))}
                    {total === 0 && <p className="text-zinc-600 text-xs italic text-center py-2">No category logs yet.</p>}
                  </div>
                </div>
              </>
            )}

            {/* CONTRADICTIONS & BIASES TAB */}
            {activeTab === "shadows" && (
              <>
                {/* Shadow Patterns */}
                <div className="flex flex-col gap-3">
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldAlert size={16} className="text-violet-400" />
                      Shadow Patterns
                    </h3>
                    <p className="text-zinc-500 text-[10px] mt-0.5">
                      Subconscious contradictions between your stated desires and actual choices.
                    </p>
                  </div>

                  {patternsData?.shadowPatterns && patternsData.shadowPatterns.length > 0 ? (
                    patternsData.shadowPatterns.map((s: any, idx: number) => (
                      <div key={idx} className="bg-[#13131e] border border-violet-900/30 hover:border-violet-600/40 rounded-2xl p-4 shadow-[0_0_15px_rgba(139,92,246,0.02)] transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="text-violet-400 animate-pulse" size={15} />
                          <h4 className="text-white font-semibold text-xs">{s.title}</h4>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed mb-3">{s.desc}</p>
                        <div className="bg-violet-950/20 border border-violet-500/15 p-2.5 rounded-xl text-[10px] text-violet-300 font-medium">
                          💡 Recommendation: {s.suggestion}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#13131e] border border-white/6 rounded-2xl p-6 text-center text-zinc-500 text-xs">
                      No shadow contradictions detected in history yet.
                    </div>
                  )}
                </div>

                {/* Cognitive Biases */}
                <div className="flex flex-col gap-3 mt-4">
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertCircle size={16} className="text-blue-400" />
                      Cognitive Biases
                    </h3>
                    <p className="text-zinc-500 text-[10px] mt-0.5">
                      Frequent mental shortcuts or heuristics that create decision biases.
                    </p>
                  </div>

                  {patternsData?.cognitiveBiases && patternsData.cognitiveBiases.length > 0 ? (
                    patternsData.cognitiveBiases.map((b: any, idx: number) => (
                      <div key={idx} className="bg-[#13131e] border border-blue-900/30 hover:border-blue-600/40 rounded-2xl p-4 shadow-[0_0_15px_rgba(59,130,246,0.02)] transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="text-blue-400" size={15} />
                          <h4 className="text-white font-semibold text-xs">{b.title}</h4>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed mb-3">{b.desc}</p>
                        <div className="bg-blue-950/20 border border-blue-500/15 p-2.5 rounded-xl text-[10px] text-blue-300 font-medium">
                          🧠 Mindset Shift: {b.advice}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#13131e] border border-white/6 rounded-2xl p-6 text-center text-zinc-500 text-xs">
                      No distinct cognitive biases isolated yet.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* DECISION TIMELINE MAP TAB */}
            {activeTab === "timeline" && (
              <div className="flex flex-col gap-1.5">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <History size={16} className="text-violet-400" />
                    Life Decision Timeline Map
                  </h3>
                  <p className="text-zinc-500 text-[10px] mt-0.5">
                    A visual chronological journey of logged choices and outcome values.
                  </p>
                </div>

                {decisions.length > 0 ? (
                  <div className="relative border-l border-white/10 pl-5 ml-2.5 flex flex-col gap-4 py-2">
                    {decisions.map(d => (
                      <div key={d.id} className="relative">
                        {/* Node marker */}
                        <div className={`absolute -left-[27.5px] top-1.5 w-4 h-4 rounded-full border-2 border-[#080810] ${
                          d.outcome === "good" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" :
                          d.outcome === "bad" ? "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]" :
                          "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                        }`} />
                        
                        {/* Interactive Entry Card */}
                        <Link href={`/decisions?id=${d.id}`}>
                          <div className="bg-[#13131e] border border-white/6 hover:border-violet-600/30 p-4 rounded-2xl transition-all flex justify-between items-start gap-4 hover:bg-[#151523]">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-[9px] text-zinc-500 font-mono font-semibold">{new Date(d.createdAt).toLocaleDateString()}</span>
                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full capitalize border shrink-0 ${catColors[d.category] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                                  {d.category}
                                </span>
                              </div>
                              <h3 className="text-white text-xs font-bold leading-snug mb-1">{d.title}</h3>
                              <p className="text-zinc-400 text-[10px] font-medium leading-relaxed truncate max-w-[220px]">
                                Choice: {d.choice}
                              </p>
                              {d.outcome !== "pending" && d.regretScore !== undefined && (
                                <p className="text-zinc-600 text-[9px] mt-1.5 font-medium">
                                  Regret Score: <span className="text-violet-400 font-mono">{d.regretScore}/10</span>
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end gap-1.5 shrink-0 h-full justify-between self-stretch">
                              {d.emotion && (
                                <span className="text-[10px] font-medium bg-white/4 border border-white/6 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                  {d.emotion}
                                </span>
                              )}
                              <ChevronRight size={14} className="text-zinc-500 mt-auto" />
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#13131e] border border-white/6 rounded-2xl p-8 text-center text-zinc-500 text-xs">
                    No decisions logged in your map yet.
                  </div>
                )}
              </div>
            )}

            {/* EMOTIONAL HEALTH TAB */}
            {activeTab === "emotions" && (
              <>
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Heart size={16} className="text-rose-400" />
                    Emotional Correlation Dashboard
                  </h3>
                  <p className="text-zinc-500 text-[10px] mt-0.5">
                    Analyzing direct correlations between emotions, stress, and choice outcomes.
                  </p>
                </div>

                {/* Stress correlation gauges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 flex flex-col items-center shadow-sm">
                    <ThumbsUp className="text-emerald-400 mb-2" size={18} />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Good Outcomes</span>
                    <span className="text-white font-mono text-xl font-bold mt-1.5">{avgGoodStress}/10</span>
                    <span className="text-zinc-500 text-[9px] mt-0.5 text-center">Avg Stress Level</span>
                  </div>

                  <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 flex flex-col items-center shadow-sm">
                    <Frown className="text-rose-400 mb-2" size={18} />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Bad Outcomes</span>
                    <span className="text-white font-mono text-xl font-bold mt-1.5">{avgBadStress}/10</span>
                    <span className="text-zinc-500 text-[9px] mt-0.5 text-center">Avg Stress Level</span>
                  </div>
                </div>

                {/* Category regret heatmap */}
                <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 mt-2">
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4">Regret Index by Category</p>
                  <div className="flex flex-col gap-3">
                    {Object.entries(catRegretStats).map(([catName, stats]: [string, any]) => {
                      const avgRegret = (stats.sum / stats.count).toFixed(1)
                      const pct = Math.round(Number(avgRegret) * 10)
                      return (
                        <div key={catName} className="flex items-center gap-3">
                          <span className="text-zinc-400 text-xs w-20 font-medium capitalize">{catName}</span>
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-zinc-500 text-xs w-8 text-right font-mono font-bold">{avgRegret}/10</span>
                        </div>
                      )
                    })}
                    {Object.keys(catRegretStats).length === 0 && (
                      <p className="text-zinc-600 text-xs italic text-center py-2">
                        Resolve pending decisions in your history to see regret levels.
                      </p>
                    )}
                  </div>
                </div>

                {/* AI Compile Emotional Insights */}
                {patternsData?.emotionalInsights && patternsData.emotionalInsights.length > 0 && (
                  <div className="flex flex-col gap-3 mt-3">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">AI Memory Correlations</p>
                    {patternsData.emotionalInsights.map((insight: string, idx: number) => (
                      <div key={idx} className="bg-[#13131e] border border-white/6 rounded-2xl p-4 flex gap-3 items-start hover:border-violet-900/30 transition-colors">
                        <Sparkles className="text-violet-400 shrink-0 mt-0.5" size={14} />
                        <p className="text-zinc-300 text-xs leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
