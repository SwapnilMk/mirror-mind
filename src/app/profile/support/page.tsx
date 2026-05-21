"use client"

import { useState } from "react"
import { ArrowLeft, HelpCircle, Mail, ChevronDown, MessageSquare, Send } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function SupportPage() {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("medium")
  const [submitting, setSubmitting] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !message) {
      toast.error("Please fill in all support fields.")
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      const ticketNum = Math.floor(10000 + Math.random() * 90000)
      toast.success(`Ticket MM-${ticketNum} submitted! A support advisor will email you soon.`)
      setSubject("")
      setMessage("")
      setPriority("medium")
      setSubmitting(false)
    }, 1200)
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      q: "How does the AI Double Simulation work?",
      a: "The Double Simulation analyzes the category, context, choices, confidence, emotions, and outcome regret values of all your historical decisions. It maps these inputs to predict your behavior in hypothetical settings or construct alternative realities.",
    },
    {
      q: "Is my personal data secure and private?",
      a: "Absolutely. All logged details are saved in a private database. Any prompts sent to Large Language Models (LLMs) to perform behavioral mappings are covered under commercial API terms, meaning they are never used to train public models.",
    },
    {
      q: "How do I resolve a 'pending' decision?",
      a: "Navigate to the Log tab, search for the decision, and click it to open the detail card. In the Reflection Panel, select the outcome status (Good/Bad), adjust your regret score and stress levels, and click 'Save Reflections'.",
    },
    {
      q: "Why does the simulator require past decisions?",
      a: "MirrorMind is not a generic chatbot. It works as a personalized behavioral mirror. To predict your decisions or map out your cognitive biases, the AI requires historical reference data from your logged choices.",
    },
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

        <h1 className="text-xl font-bold text-white mb-2">Help & Support</h1>
        <p className="text-zinc-500 text-xs mb-8">
          Submit help requests to our operations desk and read diagnostic information regarding
          cognitive profiling.
        </p>

        {/* Support ticketing form */}
        <div className="bg-[#13131e] border border-white/6 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={16} className="text-violet-400" />
            <h3 className="text-white text-sm font-bold">Submit a Support Ticket</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Issue generating simulations"
                className="w-full bg-[#0c0c14] border border-white/8 rounded-xl px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#0c0c14] border border-white/8 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
              >
                <option value="low">Low (General Feedback)</option>
                <option value="medium">Medium (Technical Question)</option>
                <option value="high">High (Service Blocked)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5">
                Detailed Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or issue in detail..."
                rows={4}
                className="w-full bg-[#0c0c14] border border-white/8 rounded-xl px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-800 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg hover:from-violet-500 hover:to-purple-700 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={12} />
                  Send Ticket
                </>
              )}
            </button>
          </form>
        </div>

        {/* FAQs */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={16} className="text-violet-400" />
            <h3 className="text-white text-sm font-bold">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="bg-[#13131e] border border-white/6 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/2 transition-colors cursor-pointer"
                  >
                    <span className="text-white text-xs font-bold leading-snug pr-4">{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-zinc-500 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-violet-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-zinc-400 text-xs leading-relaxed border-t border-white/4">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
