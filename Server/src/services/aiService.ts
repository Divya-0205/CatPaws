import { GoogleGenAI } from "@google/genai";

export interface AIReviewResult {
  score: number;
  feedback: string;
  improvements: string[];
  correctedCode: string;
}

// Optional project info the user can fill in (see ProjectContextPanel on the
// frontend). If none of these are set, the review prompt is built exactly
// the same way it always was.
export interface AIReviewContext {
  projectGoal?: string;
  techStack?: string;
  additionalContext?: string;
}

const MAX_CODE_LENGTH = 8000;

export const generateCodeReview = async (
  code: string,
  context?: AIReviewContext
): Promise<AIReviewResult> => {
  if (code.length > MAX_CODE_LENGTH) {
    throw new Error(`Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`);
  }

  const apiKey = process.env.GEMINI_API_KEY;

  console.log("API KEY Loaded:", apiKey ? "Yes" : "No");

  if (!apiKey) {
    throw new Error("API_KEY is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Build a short "here's what this project is about" block only if the
  // user actually filled in some context. If they didn't, this is an empty
  // string and the prompt below reads exactly like it did before.
  let contextBlock = "";
  if (context && (context.projectGoal || context.techStack || context.additionalContext)) {
    contextBlock += "Here is some context about this project:\n";
    if (context.projectGoal) contextBlock += `- Goal: ${context.projectGoal}\n`;
    if (context.techStack) contextBlock += `- Tech stack: ${context.techStack}\n`;
    if (context.additionalContext) contextBlock += `- Notes: ${context.additionalContext}\n`;
    contextBlock += "Keep this in mind while reviewing.\n\n";
  }

  const prompt = `
You are a senior software engineer reviewing a student's code.
${contextBlock}Analyze the following code and respond ONLY with valid JSON.
Do not include markdown, backticks, or any extra text.

Return exactly this JSON shape:

{
  "score": <number between 0 and 100>,
  "feedback": "<2-3 sentence overall summary>",
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "correctedCode": "<the full code, rewritten with your fixes applied. Keep the same language and overall structure — only change what actually needs fixing. If the code is already excellent, return it unchanged.>"
}

Important: "correctedCode" must be the complete, runnable file — not a diff, not a snippet, not just the changed lines.
Escape it properly as a JSON string (newlines as \\n, quotes as \\").

Code to review:
${code}
`;

  const modelsToTry = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-pro-latest"];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType:"application/json",
          maxOutputTokens: 5000, 
          temperature: 0.27,
          
        },
      });

      const rawText = response.text ?? "";
      console.log(`Success with ${model}. Response length:`, rawText.length);

      const cleaned = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned) as AIReviewResult;

      // Defensive fallback in case the model ever omits correctedCode despite instructions
      if (!parsed.correctedCode) {
        parsed.correctedCode = code;
      }

      return parsed;
    } catch (error: any) {
      console.error(`Model ${model} failed:`, error.status, error.message);
      lastError = error;
      if (error.status === 404 || error.status === 429) {
        continue;
      }
      throw error;
    }
  }

  throw lastError;
};