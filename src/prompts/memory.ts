export const MEMORY_CLASSIFICATION_PROMPT = `Analyze the user's statement and decide if it contains key episodic information that should be remembered long-term (e.g. major life events, job changes, relationship shifts, core fears, or emotional confessions).
USER STATEMENT: "{message}"

Respond with a raw JSON object with the following fields:
1. "isImportant": Boolean. Set to true if the importance score is >= 6.
2. "importanceScore": Int (1 to 10). Rate 1-3 for trivial chatter, 4-5 for minor details/opinions, 6-8 for significant life details, and 9-10 for major life shifts or profound emotional disclosures.
3. "summary": A brief, one-sentence memory summary written in third-person (e.g., "The user started a new role as a senior developer at Stripe" or "The user admitted that failure makes them overthink career decisions").
4. "emotion": The emotional tone associated (e.g. fear, pride, regret, anxiety, joy).

Respond ONLY with raw JSON. No markdown code blocks, no additional explanation.`
