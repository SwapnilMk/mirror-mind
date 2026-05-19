"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Download, FileText, CheckCircle2, Sliders } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ExportPage() {
  const [decisions, setDecisions] = useState<any[]>([])
  const [format, setFormat] = useState<"csv" | "json">("csv")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [exporting, setExporting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDecisions() {
      try {
        const res = await fetch("/api/decisions")
        const data = await res.json()
        if (Array.isArray(data)) {
          setDecisions(data)
        }
      } catch (err) {
        console.error("Failed to load decisions for export", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDecisions()
  }, [])

  const filteredDecisions = decisions.filter(d => {
    if (selectedCategory === "all") return true
    return d.category === selectedCategory
  })

  const handleExport = () => {
    if (filteredDecisions.length === 0) {
      toast.info("No decisions to export matching this criteria.")
      return
    }

    setExporting(true)

    setTimeout(() => {
      try {
        let content = ""
        let mimeType = ""
        let filename = `mirrormind_export_${new Date().toISOString().split('T')[0]}`

        if (format === "csv") {
          const headers = ["Title", "Category", "Situation", "Choice", "Confidence", "Outcome", "Emotion", "Regret Score", "Stress Level", "Created At"]
          const csvRows = [
            headers.join(","),
            ...filteredDecisions.map(d => {
              const values = [
                d.title || "",
                d.category || "",
                d.situation || "",
                d.choice || "",
                d.confidence ?? "",
                d.outcome || "",
                d.emotion || "Neutral",
                d.regretScore ?? 0,
                d.stressLevel ?? 5,
                d.createdAt ? new Date(d.createdAt).toISOString() : ""
              ]
              return values.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
            })
          ]
          content = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"))
          mimeType = "text/csv"
          filename += ".csv"
        } else {
          // JSON format
          const jsonContent = JSON.stringify(filteredDecisions, null, 2)
          content = "data:application/json;charset=utf-8," + encodeURIComponent(jsonContent)
          mimeType = "application/json"
          filename += ".json"
        }

        const downloadAnchor = document.createElement("a")
        downloadAnchor.setAttribute("href", content)
        downloadAnchor.setAttribute("download", filename)
        document.body.appendChild(downloadAnchor)
        downloadAnchor.click()
        downloadAnchor.remove()

        toast.success(`Successfully exported ${filteredDecisions.length} decisions!`)
      } catch (err) {
        console.error("Export generation failed", err)
        toast.error("Failed to generate export file.")
      } finally {
        setExporting(false)
      }
    }, 1000)
  }

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "work", label: "Work & Career" },
    { value: "finance", label: "Finance & Wealth" },
    { value: "relationship", label: "Relationships" },
    { value: "health", label: "Health & Vitality" },
    { value: "education", label: "Education" },
    { value: "other", label: "Other" }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] text-white">
      <div className="px-5 pt-8 pb-24 max-w-md mx-auto w-full">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center text-xs text-zinc-500 hover:text-zinc-300 gap-1.5 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Profile
          </Link>
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Export Archive</h1>
        <p className="text-zinc-500 text-xs mb-8">
          Download a complete digital archive of your decisions, emotions, regret scores, and outcomes.
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-zinc-500 text-xs">Loading decision data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Format choice */}
            <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4">
              <h3 className="text-white text-sm font-bold mb-3">Choose Format</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat("csv")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    format === "csv"
                      ? "bg-violet-600/10 border-violet-500 text-violet-300"
                      : "bg-[#0c0c14] border-white/4 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                  }`}
                >
                  <FileText size={16} />
                  CSV (Excel)
                </button>
                <button
                  onClick={() => setFormat("json")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    format === "json"
                      ? "bg-violet-600/10 border-violet-500 text-violet-300"
                      : "bg-[#0c0c14] border-white/4 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                  }`}
                >
                  <FileText size={16} />
                  JSON (Raw Data)
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sliders size={16} className="text-violet-400" />
                <h3 className="text-white text-sm font-bold">Filter by Category</h3>
              </div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-[#0c0c14] border border-white/8 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-[#13131e]">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary preview */}
            <div className="bg-[#13131e]/50 border border-dashed border-white/8 rounded-2xl p-4 text-center">
              <p className="text-zinc-500 text-xs">Decisions matching filter criteria</p>
              <p className="text-3xl font-extrabold text-white mt-2">
                {filteredDecisions.length}
                <span className="text-zinc-600 text-sm font-normal"> / {decisions.length}</span>
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 mt-2 bg-emerald-900/10 border border-emerald-900/20 py-1 px-3 rounded-full w-max mx-auto">
                <CheckCircle2 size={12} />
                Ready to download
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleExport}
              disabled={exporting || filteredDecisions.length === 0}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-800 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg hover:from-violet-500 hover:to-purple-700 hover:shadow-violet-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {exporting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download size={16} />
                  Download Archive
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
