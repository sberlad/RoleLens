/**
 * AI module entry point.
 * Initializes the default provider from environment variables.
 * Import this in server-side code to get a ready-to-use provider.
 */

import { setProvider, getProvider } from "./provider";
import { createOpenAIProvider } from "./openai";

let initialized = false;

export function initAI(): void {
  if (initialized) return;
  setProvider(createOpenAIProvider());
  initialized = true;
}

export { getProvider, setProvider };
export type { AIProvider, ChatMessage, CompletionOptions, CompletionResult } from "./provider";
