import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts"

export const dynamic = 'force-dynamic'

// GET: Fetch profile memory status and message history
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = (session.user as any).id

    // Fetch or create profile memory
    let profile = await (prisma as any).profileMemory.findUnique({
      where: { userId }
    })

    if (!profile) {
      profile = await (prisma as any).profileMemory.create({
        data: {
          userId,
          onboardingStage: 1,
        }
      })
    }

    // Fetch last 40 companion messages
    const messages = await (prisma as any).companionMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 40
    })

    // Fetch episodic memories
    const episodicMemories = await (prisma as any).episodicMemory.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" }
    })

    return NextResponse.json({
      profile,
      messages,
      episodicMemories
    })
  } catch (error) {
    console.error("GET companion error:", error)
    return NextResponse.json({ error: "Failed to load companion details" }, { status: 500 })
  }
}

// POST: Process message and execute LangGraph-style cognitive nodes
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = (session.user as any).id

    const body = await req.json()
    // Support custom payload `{ message }` or Vercel AI SDK `{ messages }` payload
    const message = body.message || (body.messages && body.messages.length > 0 ? body.messages[body.messages.length - 1].content : null)
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Initialize LLM
    const llm = new ChatOpenAI({
      apiKey: process.env.AI_API_KEY,
      configuration: {
        baseURL: process.env.AI_BASE_URL + "/v1",
      },
      modelName: process.env.AI_MODEL || "claude-sonnet-4-6",
      temperature: 0.3,
    })

    // --- NODE 1: Fetch Profile & Session Context ---
    let profile = await (prisma as any).profileMemory.findUnique({
      where: { userId }
    })
    if (!profile) {
      profile = await (prisma as any).profileMemory.create({
        data: { userId, onboardingStage: 1 }
      })
    }

    // Get chat history (last 15 messages)
    const historyMessages = await (prisma as any).companionMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 15
    })
    const formattedHistory = historyMessages.map((m: any) => `${m.role === "user" ? "User" : "MirrorMind"}: ${m.content}`).join("\n")

    // Get user's resolved decisions (to check for patterns)
    const recentDecisions = await prisma.decision.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5
    })
    const formattedDecisions = recentDecisions.map(d => 
      `- Title: "${d.title}" | Category: ${d.category} | Choice: "${d.choice}" | Outcome: "${d.outcome || 'Pending'}" | Emotion: "${(d as any).emotion || 'None'}" | Regret: ${(d as any).regretScore || 0}/10`
    ).join("\n")

    // Get episodic memories
    const episodicMemories = await (prisma as any).episodicMemory.findMany({
      where: { userId },
      take: 10
    })
    const formattedEpisodics = episodicMemories.map((e: any) => `- ${e.event} (Importance: ${e.importance}/10, Emotion: ${e.emotion || 'neutral'})`).join("\n")

    const onboardingStage = profile.onboardingStage

    // --- NODE 2: Information Extraction & Stage Advancement (AI) ---
    // If onboarding is incomplete, we run an LLM parser to extract new profile info
    let profileUpdate: any = {}
    let nextStage = onboardingStage

    if (onboardingStage < 6) {
      const extractionPrompt = `You are a cognitive data extraction node. Your goal is to analyze the user's latest message and extract details for their permanent profile.
CURRENT ONBOARDING STAGE: ${onboardingStage}
Stage details:
- Stage 1 (Warm Intro): Extract "name", "preferredName", "age" (Int), "birthday", "gender", "country", "language".
- Stage 2 (Identity & Work): Extract "profession", "company", "designation", "routine", "workStyle", "goals" (array of strings), "ambitions" (array of strings).
- Stage 3 (Personality & Emotion): Extract "fears" (array of strings), "motivations" (array of strings), "relationshipStatus", "overthinkItems" (array of strings).
- Stage 4 (Behavioral Discovery): Extract "riskStyle" (e.g. risk-averse, risk-tolerant), "traits" (array of strings).
- Stage 5 (Life Timeline): Extract "lifeEvents" (array of strings).

USER'S LATEST MESSAGE: "${message}"
RECENT CHAT HISTORY:
${formattedHistory}

Analyze the message and return a JSON object with the following fields:
1. "extracted": A sub-object containing any newly identified fields (use the exact key names above. Only include a key if the user mentioned it or answered a question about it).
2. "shouldAdvance": Boolean. Set to true if the user has sufficiently answered the current stage's questions, or has provided an answer showing engagement with the theme. Do not be overly strict; if they replied converstationally, allow advancing. If they say "skip" or "next", set to true.
3. "reasoning": Brief sentence explanation.

Respond ONLY with raw JSON. No markdown code blocks.`

      const parserResponse = await llm.invoke(extractionPrompt)
      const parsedText = (parserResponse.content as string).trim()

      let cleanParsed = parsedText
      if (cleanParsed.startsWith("```json")) cleanParsed = cleanParsed.slice(7)
      if (cleanParsed.startsWith("```")) cleanParsed = cleanParsed.slice(3)
      if (cleanParsed.endsWith("```")) cleanParsed = cleanParsed.slice(0, -3)
      cleanParsed = cleanParsed.trim()

      try {
        const result = JSON.parse(cleanParsed)
        if (result.extracted && Object.keys(result.extracted).length > 0) {
          profileUpdate = result.extracted
        }
        if (result.shouldAdvance) {
          nextStage = Math.min(6, onboardingStage + 1)
        }
      } catch (err) {
        console.error("Failed to parse profile extraction JSON:", parsedText)
      }
    }

    // --- NODE 3: Emotion & Avoidance Trend Analysis ---
    const analysisPrompt = `Analyze the emotional profile and behavioral cues in the user's latest statement.
USER MESSAGE: "${message}"

Respond with a raw JSON containing:
1. "dominantEmotion": One word matching the user's tone (e.g., Calm, Anxious, Stressed, Excited, Fearful, Confident, Melancholic, Motivated).
2. "avoidanceDetected": Boolean (true if they are avoiding questions, procrastinating, or showing self-sabotaging avoidance).
3. "overthinkingDetected": Boolean (true if they express recursive doubts or decision paralysis).

Respond ONLY with raw JSON.`

    const analysisResponse = await llm.invoke(analysisPrompt)
    const analysisText = (analysisResponse.content as string).trim()
    let cleanAnalysis = analysisText
    if (cleanAnalysis.startsWith("```json")) cleanAnalysis = cleanAnalysis.slice(7)
    if (cleanAnalysis.startsWith("```")) cleanAnalysis = cleanAnalysis.slice(3)
    if (cleanAnalysis.endsWith("```")) cleanAnalysis = cleanAnalysis.slice(0, -3)
    cleanAnalysis = cleanAnalysis.trim()

    let emotionState = "Calm"
    let behaviorCues = ""
    try {
      const analysisResult = JSON.parse(cleanAnalysis)
      emotionState = analysisResult.dominantEmotion || "Calm"
      const cues = []
      if (analysisResult.avoidanceDetected) cues.push("avoidance")
      if (analysisResult.overthinkingDetected) cues.push("overthinking")
      behaviorCues = cues.join(", ")
    } catch (err) {
      console.error("Failed to parse emotion analysis JSON:", analysisText)
    }

    // --- NODE 4: Save Structured Memory Updates ---
    // Apply updates to the profile database
    const updatePayload: any = {}
    if (profileUpdate.name) updatePayload.name = profileUpdate.name
    if (profileUpdate.preferredName) updatePayload.preferredName = profileUpdate.preferredName
    if (profileUpdate.age) updatePayload.age = parseInt(profileUpdate.age)
    if (profileUpdate.birthday) updatePayload.birthday = profileUpdate.birthday
    if (profileUpdate.gender) updatePayload.gender = profileUpdate.gender
    if (profileUpdate.country) updatePayload.country = profileUpdate.country
    if (profileUpdate.language) updatePayload.language = profileUpdate.language
    if (profileUpdate.profession) updatePayload.profession = profileUpdate.profession
    if (profileUpdate.company) updatePayload.company = profileUpdate.company
    if (profileUpdate.designation) updatePayload.designation = profileUpdate.designation
    if (profileUpdate.routine) updatePayload.routine = profileUpdate.routine
    if (profileUpdate.workStyle) updatePayload.workStyle = profileUpdate.workStyle
    if (profileUpdate.riskStyle) updatePayload.riskStyle = profileUpdate.riskStyle
    if (profileUpdate.relationshipStatus) updatePayload.relationshipStatus = profileUpdate.relationshipStatus
    if (nextStage !== onboardingStage) updatePayload.onboardingStage = nextStage

    // For arrays, append uniquely if present
    const arrayFields = ["goals", "ambitions", "traits", "fears", "motivations", "overthinkItems"]
    for (const field of arrayFields) {
      if (Array.isArray(profileUpdate[field]) && profileUpdate[field].length > 0) {
        const existing = (profile as any)[field] || []
        const combined = Array.from(new Set([...existing, ...profileUpdate[field]]))
        updatePayload[field] = combined
      }
    }

    if (Object.keys(updatePayload).length > 0) {
      profile = await (prisma as any).profileMemory.update({
        where: { userId },
        data: updatePayload
      })
    }

    // Persist life events as EpisodicMemory records
    if (Array.isArray(profileUpdate.lifeEvents) && profileUpdate.lifeEvents.length > 0) {
      for (const event of profileUpdate.lifeEvents) {
        try {
          await (prisma as any).episodicMemory.create({
            data: {
              userId,
              event: String(event),
              importance: 8,
              emotion: emotionState
            }
          })
        } catch (err) {
          console.error("Failed to persist life event:", err)
        }
      }
    }

    // --- NODE 5: Dynamic Response Generation (MirrorMind Companion) ---
    // Compile instructions based on onboarding stage or persistent chat
    let systemInstructions = ""

    if (profile.onboardingStage < 6) {
      systemInstructions = `You are MirrorMind, the user's reflective AI companion and psychological double.
You are currently in the ONBOARDING PHASE (Stage ${profile.onboardingStage} of 5).
Your goals for each stage are:
- Stage 1 (Warm Intro): Greet the user conversationally, explain that you are MirrorMind, and gradually learn their Name, Preferred name, Age, Birthday, and Location. Keep it warm.
- Stage 2 (Identity & Work): Understand their career, what they do, their daily routines, work style, and primary ambitions. Ask conversational questions (e.g., "What kind of work do you spend most of your time on?").
- Stage 3 (Personality & Emotion): Understand what stresses them, what motivates them, their biggest fears, and what they tend to overthink.
- Stage 4 (Behavioral Discovery): Identify their risk tolerance, decision style, and emotional loops.
- Stage 5 (Life Timeline): Ask about major turning points, proud achievements, or significant regrets.

CRITICAL RULES:
1. Do NOT ask all questions at once. Ask only ONE natural follow-up question per message.
2. Be warm, comforting, and deeply reflective. Speak like a close friend, not an intake form.
3. If they give brief answers, reflect back your psychological interpretation and guide them to the next question.
4. Active Onboarding Stage: ${profile.onboardingStage}. Ensure you address the theme of this stage before helping transition.
5. Never trail off your sentences. Do NOT use em dashes (—) or ellipses (...) to leave thoughts unfinished. Always complete your statements clearly.
`
    } else {
      systemInstructions = `You are MirrorMind, the user's reflective AI companion and behavioral intelligence engine.
The user has completed onboarding. You now serve as their persistent, evolving psychological mirror.

Use these memory profiles to personalize your responses:
USER IDENTITY:
- Name: ${profile.preferredName || profile.name || "Explorer"}
- Birthday: ${profile.birthday || "Not specified"}
- Career: ${profile.designation || profile.profession || "Not specified"} at ${profile.company || "Not specified"}
- Career Goals: ${profile.goals?.join(", ") || "None listed"}
- Traits: ${profile.traits?.join(", ") || "None listed"}
- Motivations: ${profile.motivations?.join(", ") || "None listed"}
- Fears/Stressors: ${profile.fears?.join(", ") || "None listed"}
- Overthinking patterns: ${profile.overthinkItems?.join(", ") || "None listed"}
- Risk Style: ${profile.riskStyle || "Balanced"}

RELEVANT EPISODIC MEMORIES:
${formattedEpisodics || "None recorded yet."}

USER'S RECENT DECISION LOGS:
${formattedDecisions || "No decisions logged yet."}

CRITICAL RULES:
1. Reference their identity, past fears, or details naturally when they fit. E.g. "Since you mentioned previously that uncertainty triggers your anxiety, I notice..."
2. Synthesize connections between what they say now and their historic decisions/outcomes.
3. Be deeply introspective, curious, and empathetic. Do not act like a search assistant. Help them reflect on their patterns.
4. If today is their birthday (based on local time ${new Date().toLocaleDateString()}), greet them warmly!
5. Never trail off your sentences. Do NOT use em dashes (—) or ellipses (...) to leave thoughts unfinished. Always complete your statements clearly.
`
    }

    const conversationPrompt = ChatPromptTemplate.fromMessages([
      ["system", systemInstructions],
      ["system", `Detected Emotional State: ${emotionState}. Behavioral Cues: ${behaviorCues || 'normal'}.`],
      ["system", `You must respond with Tagged Markdown exactly matching this format. Do not use JSON. Do not deviate.

[EMOTION] (insert single word emotion, e.g. Anxious, Calm, Reflective)
[TITLE] (insert a short 3-6 word title for this reflection)
[INSIGHTS] (insert 1-3 behavioral insights separated by a pipe |)
[PATTERNS] (insert 1-2 recognized patterns separated by a pipe |)
[SUGGESTIONS] (insert exactly 3 short reply suggestions separated by a pipe |)

[REPLY]
(Write your conversational, reflective response here. Use markdown formatting like **bold** text and paragraph spacing. Speak like a reflective companion.)`],
      ["user", `Latest Message: "${message}"\n\nHistory Context:\n${formattedHistory}\n\nMirrorMind, stream your response:`]
    ])

    // --- NODE 6: Memory Classification & Importance (Persistence) ---
    // Run asynchronously so it doesn't block TTFT (Time-To-First-Token) for the streaming response
    const runClassification = async () => {
      const classificationPrompt = `Analyze the user's statement and decide if it contains key episodic information that should be remembered long-term (e.g. major life events, job changes, relationship shifts, core fears, or emotional confessions).
USER STATEMENT: "${message}"

Respond with a raw JSON:
1. "isImportant": Boolean (true if importance score is >= 6).
2. "importanceScore": Int (1 to 10).
3. "summary": A brief, one-sentence memory summary written in third-person.
4. "emotion": The emotional tone associated (e.g., fear, pride, regret, anxiety, joy).

Respond ONLY with raw JSON.`

      try {
        const classificationResponse = await llm.invoke(classificationPrompt)
        const classificationText = (classificationResponse.content as string).trim()
        let cleanClass = classificationText
        if (cleanClass.startsWith("```json")) cleanClass = cleanClass.slice(7)
        if (cleanClass.startsWith("```")) cleanClass = cleanClass.slice(3)
        if (cleanClass.endsWith("```")) cleanClass = cleanClass.slice(0, -3)
        cleanClass = cleanClass.trim()

        const classResult = JSON.parse(cleanClass)
        if (classResult.isImportant && classResult.importanceScore >= 6) {
          await (prisma as any).episodicMemory.create({
            data: {
              userId,
              event: classResult.summary,
              importance: classResult.importanceScore,
              emotion: classResult.emotion || emotionState
            }
          })
        }
      } catch (err) {
        console.error("Failed to parse memory classification:", err)
      }
    }
    runClassification() // Fire and forget

    // Save user message immediately
    await (prisma as any).companionMessage.create({
      data: {
        userId,
        role: "user",
        content: message
      }
    })

    const responseChain = conversationPrompt.pipe(llm)
    const stream = await responseChain.stream({})

    let accumulatedText = ""
    
    const customStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const textChunk = chunk.content as string;
          accumulatedText += textChunk;
          controller.enqueue(textChunk);
        }
        controller.close();

        // AFTER stream finishes, save assistant message to database:
        try {
          await (prisma as any).companionMessage.create({
            data: { userId, role: "assistant", content: accumulatedText }
          });
        } catch(e) {
          console.error("Failed to save assistant stream to DB", e)
        }
      }
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error("POST companion error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
