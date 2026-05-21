export const EMOTION_ANALYSIS_PROMPT = `Analyze the emotional profile, sentiment, and behavioral cues in the user's latest statement.
USER MESSAGE: "{message}"

You must respond with a raw, valid JSON object with the following fields:
1. "dominantEmotion": One word matching the user's tone (must be one of: "Calm", "Anxious", "Stressed", "Excited", "Fearful", "Confident", "Melancholic", "Motivated", "Neutral").
2. "intensity": A float from 0.0 to 1.0 representing the emotional intensity (where 0.0 is completely flat/unemotional and 1.0 is extremely high emotional charge).
3. "confidence": A float from 0.0 to 1.0 representing your confidence score in this analysis.
4. "sentiment": A word representing user's overall sentiment (must be one of: "positive", "negative", "neutral").
5. "avoidance": Boolean. Set to true if the user is avoiding questions, procrastinating, changing the topic abruptly, or showing self-sabotaging avoidance.
6. "overthinking": Boolean. Set to true if they express recursive doubts, over-analyzing a single problem, circular logic, or decision paralysis.

Respond ONLY with raw JSON. No markdown code blocks, no additional explanation.`
