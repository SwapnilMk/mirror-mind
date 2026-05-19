"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Brain, BarChart3, User } from "lucide-react"

const tabs = [
  { id: "dashboard", label: "Home", icon: Home, href: "/dashboard" },
  { id: "companion", label: "Companion", icon: MessageSquare, href: "/companion" },
  { id: "simulate", label: "Ask", icon: Brain, href: "/simulate" },
  { id: "patterns", label: "Patterns", icon: BarChart3, href: "/patterns" },
  { id: "profile", label: "Me", icon: User, href: "/profile" },
]

export default function BottomNav() {
  const pathname = usePathname()

  const isPublicRoute = ["/login", "/signup", "/"].includes(pathname);
  if (isPublicRoute) return null;

  return (
    <div className="flex items-center justify-around border border-white/5 bg-[#0d0d14]/90 backdrop-blur-xl py-3 px-2 h-[72px] sm:rounded-t-[32px] shadow-2xl">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className="flex flex-col items-center gap-1 px-3 py-1 transition-colors"
          >
            <tab.icon size={20} className={active ? "text-primary" : "text-zinc-600"} />
            <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-zinc-600"}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
