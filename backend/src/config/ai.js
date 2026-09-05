import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const groqApiKey = process.env.GROQ_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

export const groqClient = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;
export const geminiClient = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

/**
 * Unified AI completion wrapper:
 * Tries Gemini 2.5 Flash -> falls back to Groq -> falls back to structured JSON.
 */
export async function generateAICompletion({ systemPrompt, userPrompt, temperature = 0.3 }) {
  const startMs = Date.now();

  // 1. Primary: Gemini 2.5 Flash
  if (geminiClient) {
    try {
      const model = geminiClient.getGenerativeModel({
        model: "gemini-2.5-flash",
      });
      const fullPrompt = `${systemPrompt}\n\nTask: ${userPrompt}\n\nRespond strictly in valid JSON format only.`;
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
      parsed._aiMeta = {
        aiModelUsed: "gemini-2.5-flash",
        aiProvider: "Google DeepMind",
        aiLatencyMs: Date.now() - startMs,
        fallbackUsed: false
      };
      return parsed;
    } catch (err) {
      console.warn("Gemini inference failed, trying Groq:", err.message);
    }
  }

  // 2. Secondary: Groq (with max_tokens to avoid OTPM rate limit)
  if (groqClient) {
    try {
      const response = await groqClient.chat.completions.create({
        model: "qwen/qwen3.8-27b",
        messages: [
          { role: "system", content: systemPrompt + "\n\nIMPORTANT: You must respond in valid JSON format only." },
          { role: "user", content: userPrompt }
        ],
        temperature,
        max_tokens: 350
      });
      const text = response.choices[0]?.message?.content || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
      parsed._aiMeta = {
        aiModelUsed: "qwen/qwen3.8-27b",
        aiProvider: "Groq Cloud",
        aiLatencyMs: Date.now() - startMs,
        fallbackUsed: true
      };
      return parsed;
    } catch (err) {
      console.warn("Groq inference failed:", err.message);
    }
  }

  return null;
}
