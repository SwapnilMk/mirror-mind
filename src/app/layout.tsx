import type { Metadata } from "next"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import AuthProvider from "@/components/providers/SessionProvider"
import LayoutWrapper from "@/components/layout/LayoutWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MirrorMind",
  description: "Your decision intelligence mirror.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.className} antialiased bg-[#080810] text-white min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#13131e",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  )
}
