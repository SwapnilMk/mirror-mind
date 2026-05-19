"use client"

import { usePathname } from "next/navigation"
import BottomNav from "@/components/layout/BottomNav"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCompanion = pathname === "/companion"

  return (
    <div className={`w-full ${isCompanion ? "h-dvh overflow-hidden flex flex-col" : "min-h-screen flex flex-col"}`}>
      {/* Dynamic Content Container */}
      <main className={`flex-1 w-full relative transition-all duration-300 ${isCompanion ? "max-w-full overflow-hidden flex flex-col" : "max-w-2xl mx-auto"}`}>
        {children}
      </main>

      {/* Persistent Bottom Navigation */}
      <div className={`sticky bottom-0 w-full z-50 transition-all duration-300 ${isCompanion ? "max-w-full shrink-0" : "max-w-2xl mx-auto"}`}>
        <BottomNav />
      </div>
    </div>
  )
}
