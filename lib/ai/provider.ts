/**
 * Abstract AI provider interface.
 * All LLM calls go through this interface so providers can be swapped
 * without changing application code.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** If true, request JSON output (provider must support it) */
  jsonMode?: boolean;
}

export interface CompletionResult {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  name: string;
  complete(messages: ChatMessage[], options?: CompletionOptions): Promise<CompletionResult>;
}

let _provider: AIProvider | null = null;

export function setProvider(provider: AIProvider): void {
  _provider = provider;
}

export function getProvider(): AIProvider {
  if (!_provider) {
    throw new Error(
      "No AI provider configured. Call setProvider() or ensure the default provider is initialized.",
    );
  }
  return _provider;
}
