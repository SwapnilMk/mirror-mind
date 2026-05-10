import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { situation, category } = await req.json()
    if (!situation) {
      return NextResponse.json({ error: "situation is required" }, { status: 400 })
    }

    // Ported logic from api-server
    let pool = await prisma.decision.findMany({
      where: {
        outcome: { not: "bad" },
        ...(category ? { category } : {})
      }
    })

    if (!pool.length) {
      return NextResponse.json({ 
        predictedChoice: "No matching decisions found. Add more decisions to enable simulation.", 
        basedOn: 0 
      })
    }

    const words = String(situation).toLowerCase().split(/\s+/).filter(w => w.length > 3)

    const scored = pool.map((d: any) => {
      const text = (d.title + " " + d.situation + " " + d.category).toLowerCase()
      const score = words.filter(w => text.includes(w)).length
      return { ...d, score }
    }).sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0) || b.confidence - a.confidence)

    const best = scored[0]
    const matches = scored.slice(0, 3).filter((d: any) => (d.score ?? 0) > 0 || d === best).map((d: any) => ({
      title: d.title, choice: d.choice, score: d.score,
    }))

    return NextResponse.json({
      predictedChoice: best.choice,
      matchedDecision: best.title,
      basedOn: pool.length,
      confidence: (best.score ?? 0) > 0 ? `keyword match (${best.score} hits)` : "highest confidence decision",
      matches,
    })
  } catch (error) {
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 })
  }
}
