// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Analyze 360 feedback gap and generate coaching insights
export async function analyze360Feedback(data: {
  managerId: string;
  selfAssessment: Record<string, number>;
  feedbacks: Array<{ responses: Record<string, number>; comments: Record<string, string> }>;
  competencies: Array<{ id: string; name: string }>;
}): Promise<{
  summary: string;
  themes: string[];
  strengths: string[];
  developmentAreas: string[];
  actionItems: string[];
  sentimentScore: number;
}> {
  try {
    const competencyMap = Object.fromEntries(
      data.competencies.map((c) => [c.id, c.name])
    );

    // Calculate average feedback scores
    const avgFeedback: Record<string, number> = {};
    Object.keys(data.selfAssessment).forEach((compId) => {
      const scores = data.feedbacks
        .map((f) => f.responses[compId])
        .filter((s) => s !== undefined);
      avgFeedback[compId] = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
    });

    // Collect all comments
    const allComments = data.feedbacks
      .flatMap((f) => Object.values(f.comments))
      .join("\n");

    const prompt = `You are an executive coach analyzing 360° feedback for a manager. Analyze the following data:

SELF-ASSESSMENT SCORES (1-10 scale):
${Object.entries(data.selfAssessment)
      .map(([id, score]) => `${competencyMap[id]}: ${score}`)
      .join("\n")}

AVERAGE 360° FEEDBACK SCORES (1-10 scale):
${Object.entries(avgFeedback)
      .map(([id, score]) => `${competencyMap[id]}: ${score.toFixed(1)}`)
      .join("\n")}

QUALITATIVE FEEDBACK COMMENTS:
${allComments}

Based on this data:
1. Identify BLIND SPOTS (competencies where self-rating is significantly higher than 360 feedback)
2. Extract 3 key THEMES from the qualitative feedback
3. List 3 STRENGTHS (areas of alignment or high scores)
4. List 3 DEVELOPMENT AREAS (gaps and weaknesses)
5. Provide 5 specific ACTION ITEMS grounded in HR theory (GROW model, SBI framework, Johari Window, Path-Goal theory)
6. Provide an overall sentiment score from -1 (very negative) to +1 (very positive)

Respond with JSON in this exact format:
{
  "summary": "2-3 sentence executive summary",
  "themes": ["theme1", "theme2", "theme3"],
  "strengths": ["strength1", "strength2", "strength3"],
  "developmentAreas": ["area1", "area2", "area3"],
  "actionItems": ["action1", "action2", "action3", "action4", "action5"],
  "sentimentScore": 0.0
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            themes: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            developmentAreas: { type: "array", items: { type: "string" } },
            actionItems: { type: "array", items: { type: "string" } },
            sentimentScore: { type: "number" },
          },
          required: ["summary", "themes", "strengths", "developmentAreas", "actionItems", "sentimentScore"],
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(rawJson);
  } catch (error) {
    console.error("Gemini 360 analysis error:", error);
    throw new Error(`Failed to analyze 360 feedback: ${error}`);
  }
}

// Analyze journal entry sentiment
export async function analyzeJournalSentiment(text: string): Promise<{
  sentimentScore: number;
  emotionTags: string[];
}> {
  try {
    const systemPrompt = `You are an emotional intelligence coach analyzing a leadership journal entry. 
Analyze the sentiment and emotions expressed in the text.
Provide:
1. A sentiment score from -1 (very negative) to +1 (very positive)
2. Up to 5 emotion tags (e.g., "confident", "anxious", "reflective", "frustrated", "hopeful")

Respond with JSON in this format:
{
  "sentimentScore": 0.0,
  "emotionTags": ["emotion1", "emotion2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            sentimentScore: { type: "number" },
            emotionTags: { type: "array", items: { type: "string" } },
          },
          required: ["sentimentScore", "emotionTags"],
        },
      },
      contents: text,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(rawJson);
  } catch (error) {
    console.error("Gemini sentiment analysis error:", error);
    // Return neutral fallback
    return { sentimentScore: 0, emotionTags: [] };
  }
}

// Role-play: Generate AI response as direct report
export async function generateRoleplayResponse(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    const systemPrompt = `You are playing the role of a direct report receiving feedback from your manager. 
Respond naturally and realistically to the manager's message. 
- If the feedback is constructive and empathetic, respond positively and receptively
- If the feedback is too harsh or unclear, express confusion or defensiveness 
- Keep responses conversational and realistic (2-3 sentences)
- Vary your tone based on how well the manager uses SBI (Situation-Behavior-Impact) model`;

    // Convert messages to conversation format
    const conversation = messages.map((m) => 
      m.role === "user" 
        ? `Manager: ${m.content}` 
        : `Direct Report: ${m.content}`
    ).join("\n\n");

    const prompt = `${conversation}\n\nDirect Report:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: prompt,
    });

    return response.text || "I understand. Can you tell me more?";
  } catch (error) {
    console.error("Gemini roleplay error:", error);
    return "I'm listening. Please continue.";
  }
}

// Evaluate role-play session
export async function evaluateRoleplaySession(
  messages: Array<{ role: string; content: string }>
): Promise<{
  evaluation: string;
  sbiScore: number;
  toneScore: number;
}> {
  try {
    const conversation = messages.map((m) => 
      m.role === "user" 
        ? `Manager: ${m.content}` 
        : `Direct Report: ${m.content}`
    ).join("\n\n");

    const prompt = `As an executive coach, evaluate this feedback role-play session:

${conversation}

Evaluate the manager's performance on:
1. SBI Score (1-10): How well did they use Situation-Behavior-Impact model? Did they cite specific situations, describe observable behaviors, and explain impact?
2. Tone Score (1-10): Was the tone empathetic, clear, and professional? Did they listen and acknowledge the direct report's perspective?

Provide specific feedback on what the manager did well and what they could improve.

Respond with JSON:
{
  "evaluation": "2-3 sentences of specific feedback",
  "sbiScore": 8,
  "toneScore": 7
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            evaluation: { type: "string" },
            sbiScore: { type: "number" },
            toneScore: { type: "number" },
          },
          required: ["evaluation", "sbiScore", "toneScore"],
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(rawJson);
  } catch (error) {
    console.error("Gemini roleplay evaluation error:", error);
    return {
      evaluation: "Unable to evaluate session. Please try again.",
      sbiScore: 5,
      toneScore: 5,
    };
  }
}

// Generate simulation feedback
export async function generateSimulationFeedback(
  scenario: string,
  choice: string,
  theory: string
): Promise<string> {
  try {
    const prompt = `As a leadership coach, provide feedback on this decision:

SCENARIO: ${scenario}
CHOICE MADE: ${choice}
LEADERSHIP THEORY: ${theory}

Explain in 2-3 sentences:
1. How this choice relates to ${theory}
2. The likely impact on team dynamics
3. One key learning point`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Good choice. Consider how this aligns with your team's needs.";
  } catch (error) {
    console.error("Gemini simulation feedback error:", error);
    return "Decision recorded. Reflect on how this aligns with your leadership values.";
  }
}
