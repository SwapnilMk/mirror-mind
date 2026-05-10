import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const outcome = searchParams.get("outcome")
    const search = searchParams.get("search")

    const where: any = {}
    if (category) where.category = category
    if (outcome) where.outcome = outcome
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { situation: { contains: search, mode: 'insensitive' } },
        { choice: { contains: search, mode: 'insensitive' } }
      ]
    }

    const decisions = await prisma.decision.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(decisions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch decisions" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const decision = await prisma.decision.create({
      data: {
        title: body.title,
        situation: body.situation,
        choice: body.choice,
        category: body.category || "other",
        confidence: body.confidence || 70,
        outcome: body.outcome || "pending"
      }
    })
    return NextResponse.json(decision)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create decision" }, { status: 500 })
  }
}
