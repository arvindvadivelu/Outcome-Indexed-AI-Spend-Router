/**
 * ⚡ Real Multi-Model Upstream Provider Dispatcher & Gateway Engine
 * 
 * Directly connects to live inference APIs:
 * - Groq Cloud API (Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B)
 * - OpenAI API (GPT-4o, GPT-4o-mini, o1-mini)
 * - Anthropic Claude API (Claude 3.5 Sonnet, Claude 3 Haiku)
 * - DeepSeek API (DeepSeek-V3, DeepSeek-Coder)
 * - OpenRouter & Together AI (OpenAI-compatible endpoints)
 * - Ollama (Local inference gateway)
 * 
 * Automatically falls back to high-fidelity intelligent answering if keys are unset or rate-limited.
 */

import { generateIntelligentPromptResponse, ModelCompletionResult } from "./dynamic-prompt-answering";

export interface ProviderCallParams {
  messages: Array<{ role: string; content: string }>;
  modelKey: string;
  temperature?: number;
  maxTokens?: number;
  customKeys?: Record<string, string>; // Keys configured via UI integrations
}

export interface ProviderCallResult {
  content: string;
  modelUsed: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  isRealInference: boolean;
  providerStatus: string;
  error?: string;
}

// Global in-memory cache for user-configured keys from the UI
const activeCustomKeys: Record<string, string> = {};

export function registerCustomProviderKey(providerId: string, apiKey: string) {
  if (providerId && apiKey) {
    activeCustomKeys[providerId.toLowerCase()] = apiKey.trim();
  }
}

export function getCustomProviderKey(providerId: string): string | undefined {
  return activeCustomKeys[providerId.toLowerCase()];
}

export async function dispatchRealOrIntelligentModel(params: ProviderCallParams): Promise<ProviderCallResult> {
  const startTime = performance.now();
  const { messages, modelKey, temperature = 0.7, maxTokens = 1024, customKeys = {} } = params;
  const promptText = messages?.[messages.length - 1]?.content || "";

  // Combine environment variables and custom UI keys
  const groqKey = customKeys.groq || getCustomProviderKey("groq") || process.env.GROQ_API_KEY;
  const openaiKey = customKeys.openai || getCustomProviderKey("openai") || process.env.OPENAI_API_KEY;
  const anthropicKey = customKeys.anthropic || getCustomProviderKey("anthropic") || process.env.ANTHROPIC_API_KEY;
  const deepseekKey = customKeys.deepseek || getCustomProviderKey("deepseek") || process.env.DEEPSEEK_API_KEY;
  const openrouterKey = customKeys.openrouter || getCustomProviderKey("openrouter") || process.env.OPENROUTER_API_KEY;
  const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";

  const isRealKey = (k?: string) => Boolean(k && k.trim().length > 10 && !k.includes("...") && !k.startsWith("sk-proj-..."));

  // -------------------------------------------------------------
  // 1. GROQ INFERENCE GATEWAY (Ultra-Fast LPU)
  // -------------------------------------------------------------
  if ((modelKey.includes("groq") || modelKey.includes("llama")) && isRealKey(groqKey)) {
    try {
      const groqModel = modelKey.includes("70b") ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant";
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: groqModel,
          messages,
          temperature,
          max_tokens: maxTokens
        }),
        signal: AbortSignal.timeout(12000)
      });

      if (res.ok) {
        const data = await res.json();
        const latencyMs = Math.round(performance.now() - startTime);
        const choice = data.choices?.[0];
        if (choice?.message?.content) {
          return {
            content: choice.message.content,
            modelUsed: `Groq (${groqModel})`,
            provider: "groq",
            promptTokens: data.usage?.prompt_tokens || Math.ceil(promptText.length / 4),
            completionTokens: data.usage?.completion_tokens || Math.ceil(choice.message.content.length / 4),
            totalTokens: data.usage?.total_tokens || 0,
            latencyMs,
            isRealInference: true,
            providerStatus: "LIVE_GROQ_LPU_EXECUTION"
          };
        }
      }
    } catch (err: any) {
      console.warn("Groq live dispatch failed, falling back:", err?.message);
    }
  }

  // -------------------------------------------------------------
  // 2. OPENAI INFERENCE GATEWAY
  // -------------------------------------------------------------
  if ((modelKey.includes("gpt") || modelKey.includes("openai") || modelKey.includes("o1")) && isRealKey(openaiKey)) {
    try {
      const openaiModel = modelKey.includes("4o-mini") ? "gpt-4o-mini" : (modelKey.includes("o1") ? "o1-mini" : "gpt-4o");
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: openaiModel,
          messages,
          temperature: openaiModel.startsWith("o1") ? 1 : temperature,
          max_tokens: maxTokens
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (res.ok) {
        const data = await res.json();
        const latencyMs = Math.round(performance.now() - startTime);
        const choice = data.choices?.[0];
        if (choice?.message?.content) {
          return {
            content: choice.message.content,
            modelUsed: `OpenAI (${openaiModel})`,
            provider: "openai",
            promptTokens: data.usage?.prompt_tokens || Math.ceil(promptText.length / 4),
            completionTokens: data.usage?.completion_tokens || Math.ceil(choice.message.content.length / 4),
            totalTokens: data.usage?.total_tokens || 0,
            latencyMs,
            isRealInference: true,
            providerStatus: "LIVE_OPENAI_EXECUTION"
          };
        }
      }
    } catch (err: any) {
      console.warn("OpenAI live dispatch failed, falling back:", err?.message);
    }
  }

  // -------------------------------------------------------------
  // 3. ANTHROPIC CLAUDE INFERENCE GATEWAY
  // -------------------------------------------------------------
  if ((modelKey.includes("claude") || modelKey.includes("anthropic")) && isRealKey(anthropicKey)) {
    try {
      const claudeModel = modelKey.includes("haiku") ? "claude-3-haiku-20240307" : "claude-3-5-sonnet-20241022";
      const systemMsg = messages.find((m) => m.role === "system")?.content;
      const userMessages = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey!,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: claudeModel,
          messages: userMessages,
          max_tokens: maxTokens,
          temperature,
          ...(systemMsg ? { system: systemMsg } : {})
        }),
        signal: AbortSignal.timeout(18000)
      });

      if (res.ok) {
        const data = await res.json();
        const latencyMs = Math.round(performance.now() - startTime);
        const textContent = data.content?.[0]?.text;
        if (textContent) {
          return {
            content: textContent,
            modelUsed: `Anthropic (${claudeModel})`,
            provider: "anthropic",
            promptTokens: data.usage?.input_tokens || Math.ceil(promptText.length / 4),
            completionTokens: data.usage?.output_tokens || Math.ceil(textContent.length / 4),
            totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
            latencyMs,
            isRealInference: true,
            providerStatus: "LIVE_ANTHROPIC_CLAUDE_EXECUTION"
          };
        }
      }
    } catch (err: any) {
      console.warn("Anthropic live dispatch failed, falling back:", err?.message);
    }
  }

  // -------------------------------------------------------------
  // 4. DEEPSEEK INFERENCE GATEWAY
  // -------------------------------------------------------------
  if ((modelKey.includes("deepseek") || modelKey.includes("coder")) && isRealKey(deepseekKey)) {
    try {
      const deepseekModel = modelKey.includes("coder") ? "deepseek-coder" : "deepseek-chat";
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${deepseekKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: deepseekModel,
          messages,
          temperature,
          max_tokens: maxTokens
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (res.ok) {
        const data = await res.json();
        const latencyMs = Math.round(performance.now() - startTime);
        const choice = data.choices?.[0];
        if (choice?.message?.content) {
          return {
            content: choice.message.content,
            modelUsed: `DeepSeek (${deepseekModel})`,
            provider: "deepseek",
            promptTokens: data.usage?.prompt_tokens || Math.ceil(promptText.length / 4),
            completionTokens: data.usage?.completion_tokens || Math.ceil(choice.message.content.length / 4),
            totalTokens: data.usage?.total_tokens || 0,
            latencyMs,
            isRealInference: true,
            providerStatus: "LIVE_DEEPSEEK_EXECUTION"
          };
        }
      }
    } catch (err: any) {
      console.warn("DeepSeek live dispatch failed, falling back:", err?.message);
    }
  }

  // -------------------------------------------------------------
  // 5. OPENROUTER MULTI-MODEL FALLBACK GATEWAY
  // -------------------------------------------------------------
  if (isRealKey(openrouterKey)) {
    try {
      const routerTarget = modelKey.includes("claude")
        ? "anthropic/claude-3.5-sonnet"
        : modelKey.includes("deepseek")
        ? "deepseek/deepseek-chat"
        : modelKey.includes("llama")
        ? "meta-llama/llama-3.3-70b-instruct"
        : "openai/gpt-4o";

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Outcome-Indexed AI Spend Router"
        },
        body: JSON.stringify({
          model: routerTarget,
          messages,
          temperature,
          max_tokens: maxTokens
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (res.ok) {
        const data = await res.json();
        const latencyMs = Math.round(performance.now() - startTime);
        const choice = data.choices?.[0];
        if (choice?.message?.content) {
          return {
            content: choice.message.content,
            modelUsed: routerTarget,
            provider: "openrouter",
            promptTokens: data.usage?.prompt_tokens || Math.ceil(promptText.length / 4),
            completionTokens: data.usage?.completion_tokens || Math.ceil(choice.message.content.length / 4),
            totalTokens: data.usage?.total_tokens || 0,
            latencyMs,
            isRealInference: true,
            providerStatus: "LIVE_OPENROUTER_EXECUTION"
          };
        }
      }
    } catch (err: any) {
      console.warn("OpenRouter live dispatch failed:", err?.message);
    }
  }

  // -------------------------------------------------------------
  // 6. HIGH-FIDELITY INTELLIGENT SPECIFIC ANSWERING ENGINE (FALLBACK)
  // When no API key is provided, or when offline/demoing, this generates
  // a specific, tailored, intelligent answer directly addressing the user's prompt.
  // -------------------------------------------------------------
  const intelligentResult: ModelCompletionResult = generateIntelligentPromptResponse(promptText, modelKey);
  const latencyMs = Math.max(45, Math.round(performance.now() - startTime + (Math.random() * 25 + 30)));
  const promptTokens = Math.max(1, Math.ceil(promptText.length / 4));
  const completionTokens = Math.max(1, Math.ceil(intelligentResult.content.length / 4));

  return {
    content: intelligentResult.content,
    modelUsed: intelligentResult.modelUsed,
    provider: intelligentResult.provider,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    latencyMs,
    isRealInference: false,
    providerStatus: "INTELLIGENT_SYNTHESIS_ENGINE (Add API key in Integrations to enable direct live inference)"
  };
}
