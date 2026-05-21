import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-medium mb-6 animate-fade-in">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>New: AI-Powered Mirroring is here</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
          Reflect Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent">
            Inner World
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          MirrorMind helps you capture your thoughts, emotions, and growth in a digital sanctuary
          designed for clarity and peace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold group">
            Start Your Journey
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 h-12 text-base font-semibold"
          >
            Watch Demo
          </Button>
        </div>

        {/* Visual Element - Glass Mirror Card */}
        <div className="mt-20 relative max-w-5xl mx-auto">
          <div className="relative z-10 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden aspect-video group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-center h-full">
              <div className="text-white/20 font-black text-9xl tracking-tighter select-none">
                MIRROR
              </div>
            </div>

            {/* Inner "Mirror" Content */}
            <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-white/10 border border-white/10 p-4 transition-transform group-hover:-translate-y-2 delay-[i*100ms]"
                >
                  <div className="h-2 w-1/2 bg-white/20 rounded-full mb-2" />
                  <div className="h-2 w-full bg-white/10 rounded-full mb-1" />
                  <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Shadow/Reflect */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[80%] h-24 bg-primary/20 blur-[100px] -z-10" />
        </div>
      </div>
    </section>
  )
}
