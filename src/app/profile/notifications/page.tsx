"use client"

import { useState } from "react"
import { ArrowLeft, Bell, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState({
    weeklySummary: true,
    behavioralDrift: true,
    simulationComplete: false,
    securityAlerts: true,
  })
  const [saving, setSaving] = useState(false)

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Notification preferences saved successfully!")
    }, 800)
  }

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

        <h1 className="text-xl font-bold text-white mb-2">Notification Settings</h1>
        <p className="text-zinc-500 text-xs mb-8">
          Choose how and when MirrorMind contacts you regarding your cognitive mapping and
          self-sabotage insights.
        </p>

        {/* Preference cards */}
        <div className="space-y-4 mb-8">
          {/* Item 1 */}
          <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-violet-900/30 border border-violet-800/40 flex items-center justify-center text-violet-400 mt-0.5">
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-sm font-bold">Weekly Reflection Summary</h3>
              <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                Receive an AI-synthesized weekly report detailing your behavioral trends and
                emotional cycles.
              </p>
            </div>
            <button
              onClick={() => handleToggle("weeklySummary")}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none mt-1 ${
                preferences.weeklySummary ? "bg-violet-600" : "bg-zinc-800"
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white absolute top-[3px] transition-transform ${
                  preferences.weeklySummary ? "translate-x-5.5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Item 2 */}
          <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-800/40 flex items-center justify-center text-purple-400 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-sm font-bold">Behavioral Drift Alerts</h3>
              <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                Get notified when your choices diverge significantly from your stated core values or
                habits.
              </p>
            </div>
            <button
              onClick={() => handleToggle("behavioralDrift")}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none mt-1 ${
                preferences.behavioralDrift ? "bg-violet-600" : "bg-zinc-800"
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white absolute top-[3px] transition-transform ${
                  preferences.behavioralDrift ? "translate-x-5.5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Item 3 */}
          <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-amber-900/30 border border-amber-800/40 flex items-center justify-center text-amber-400 mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-sm font-bold">Simulation Completions</h3>
              <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                Alert me when heavy computation parallel timeline simulations finish running in the
                background.
              </p>
            </div>
            <button
              onClick={() => handleToggle("simulationComplete")}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none mt-1 ${
                preferences.simulationComplete ? "bg-violet-600" : "bg-zinc-800"
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white absolute top-[3px] transition-transform ${
                  preferences.simulationComplete ? "translate-x-5.5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Item 4 */}
          <div className="bg-[#13131e] border border-white/6 rounded-2xl p-4 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-900/30 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mt-0.5">
              <ShieldCheck size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-sm font-bold">Security & Login Alerts</h3>
              <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                Receive instant emails for new logins, password updates, or API token changes.
              </p>
            </div>
            <button
              onClick={() => handleToggle("securityAlerts")}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none mt-1 ${
                preferences.securityAlerts ? "bg-violet-600" : "bg-zinc-800"
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white absolute top-[3px] transition-transform ${
                  preferences.securityAlerts ? "translate-x-5.5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-800 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg hover:from-violet-500 hover:to-purple-700 hover:shadow-violet-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Save Preferences"
          )}
        </button>
      </div>
    </div>
  )
}
