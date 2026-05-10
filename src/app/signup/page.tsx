"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Brain, Eye, EyeOff } from "lucide-react"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Account created! Please sign in.")
        router.push("/login")
      } else {
        toast.error(data.error || "Registration failed")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] px-6 pt-20 pb-10">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center shadow-xl shadow-violet-900/40 mx-auto mb-6">
          <Brain size={32} color="white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-zinc-500 text-sm">Start your decision intelligence journey</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Full Name</label>
          <input
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Alex Rivera"
            className="w-full bg-[#13131e] border border-white/8 rounded-xl text-white text-sm px-4 py-3.5 outline-none focus:border-violet-600 transition-colors placeholder:text-zinc-700"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-[#13131e] border border-white/8 rounded-xl text-white text-sm px-4 py-3.5 outline-none focus:border-violet-600 transition-colors placeholder:text-zinc-700"
          />
        </div>
        <div className="relative">
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="8+ characters"
            className="w-full bg-[#13131e] border border-white/8 rounded-xl text-white text-sm px-4 py-3.5 pr-12 outline-none focus:border-violet-600 transition-colors placeholder:text-zinc-700"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 bottom-3.5 text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:text-zinc-400 text-white font-semibold py-4 rounded-2xl text-sm transition-colors mt-4 shadow-lg shadow-violet-900/40"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-zinc-600 text-xs text-center mt-2 px-8">
        By signing up you agree to our{" "}
        <button className="text-violet-400 font-medium hover:underline">Terms</button>
        {" "}&amp;{" "}
        <button className="text-violet-400 font-medium hover:underline">Privacy Policy</button>
      </p>

      <div className="flex-1 min-h-[40px]"/>

      <p className="text-zinc-600 text-xs text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-violet-400 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
