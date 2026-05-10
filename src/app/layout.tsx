import type { Metadata } from "next";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import BottomNav from "@/components/layout/BottomNav";
import AuthProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MirrorMind",
  description: "Your decision intelligence mirror.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} antialiased bg-[#080810] text-white min-h-screen flex flex-col`} suppressHydrationWarning>
        <AuthProvider>
          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-2xl mx-auto relative">
            {children}
          </main>

          {/* Persistent Bottom Navigation */}
          <div className="sticky bottom-0 w-full max-w-2xl mx-auto z-50">
            <BottomNav />
          </div>
        </AuthProvider>

        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
