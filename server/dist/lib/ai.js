import openai from "../configs/openai.js";
const fallbackModels = [
    "google/gemini-2.0-flash-exp:free",
    "google/gemini-2.5-flash-preview",
    "meta-llama/llama-3.3-70b-instruct:free",
    "openai/gpt-4o-mini",
];
const configuredModels = (process.env.AI_MODELS || process.env.AI_MODEL || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
const modelCandidates = configuredModels.length ? configuredModels : fallbackModels;
const isRetryableModelError = (error) => {
    const status = error?.status;
    const code = error?.code;
    const message = String(error?.message || "").toLowerCase();
    return (status === 404 ||
        status === 400 ||
        code === "model_not_found" ||
        message.includes("model") && (message.includes("not found") || message.includes("unavailable")));
};
export const createChatCompletion = async (messages) => {
    let lastError;
    for (const model of modelCandidates) {
        try {
            return await openai.chat.completions.create({
                model,
                messages,
            });
        }
        catch (error) {
            lastError = error;
            if (!isRetryableModelError(error)) {
                throw error;
            }
            console.warn(`[ai] Model "${model}" failed (${error?.status || error?.code || "unknown"}), trying next model...`);
        }
    }
    throw lastError;
};
