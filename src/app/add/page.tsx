"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const categories = ["Work", "Finance", "Lifestyle", "Health", "Relationships", "Other"];

export default function AddDecisionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "Work",
    confidence: 70,
    situation: "",
    choice: "",
    outcome: "pending"
  })

  async function handleSubmit() {
    if (!formData.title || !formData.situation || !formData.choice) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success("Decision recorded successfully")
        router.push("/dashboard")
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      toast.error("Error saving decision")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] text-white">
      <div className="px-5 pt-10 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft size={22} />
          </Link>
          <h1 className="text-xl font-bold text-white">New Decision</h1>
        </div>

        <div className="flex flex-col gap-4 pb-20">
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Decision Title</label>
            <input
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Accept the job offer"
              className="w-full bg-[#13131e] border border-white/8 rounded-xl text-white text-sm px-4 py-3.5 outline-none focus:border-violet-600 transition-colors placeholder:text-zinc-700"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-medium mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setFormData({...formData, category: c.toLowerCase()})}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    formData.category === c.toLowerCase()
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-transparent border-white/10 text-zinc-500 hover:border-violet-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Situation</label>
            <textarea
              value={formData.situation}
              onChange={e => setFormData({...formData, situation: e.target.value})}
              placeholder="Describe the context and what led you here..."
              rows={3}
              className="w-full bg-[#13131e] border border-white/8 rounded-xl text-white text-sm px-4 py-3 outline-none focus:border-violet-600 transition-colors placeholder:text-zinc-700 resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Final Choice</label>
            <input
              value={formData.choice}
              onChange={e => setFormData({...formData, choice: e.target.value})}
              placeholder="What did you decide?"
              className="w-full bg-[#13131e] border border-white/8 rounded-xl text-white text-sm px-4 py-3.5 outline-none focus:border-violet-600 transition-colors placeholder:text-zinc-700"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-500 font-medium">Confidence Level</label>
              <span className="text-violet-400 text-sm font-bold">{formData.confidence}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={formData.confidence}
              onChange={e => setFormData({...formData, confidence: Number(e.target.value)})}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-zinc-700 text-[10px] mt-1">
              <span>Unsure</span><span>Very confident</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full font-semibold py-4 rounded-2xl text-sm transition-all mt-2 ${
              loading ? "bg-violet-800 text-zinc-400 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-500 text-white"
            }`}
          >
            {loading ? "Saving..." : "Save Decision"}
          </button>
        </div>
      </div>
    </div>
  )
}
