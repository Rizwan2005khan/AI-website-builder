import openai from "../configs/openai.js";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const fallbackModels = [
  "openrouter/auto",
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

const configuredModels = (process.env.AI_MODELS || process.env.AI_MODEL || "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const modelCandidates = configuredModels.length ? configuredModels : fallbackModels;

const isRetryableModelError = (error: any) => {
  const status = error?.status;
  const code = error?.code;
  const message = String(error?.message || "").toLowerCase();
  return (
    status === 404 ||
    status === 400 ||
    status === 429 ||
    code === "model_not_found" ||
    message.includes("model") && (message.includes("not found") || message.includes("unavailable"))
  );
};

export const createChatCompletion = async (messages: ChatMessage[]) => {
  let lastError: any;

  for (const model of modelCandidates) {
    try {
      return await openai.chat.completions.create({
        model,
        messages,
      });
    } catch (error: any) {
      lastError = error;
      if (!isRetryableModelError(error)) {
        throw error;
      }
      console.warn(`[ai] Model "${model}" failed (${error?.status || error?.code || "unknown"}), trying next model...`);
    }
  }

  throw lastError;
};

