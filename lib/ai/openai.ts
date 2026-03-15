/**
 * OpenAI provider implementation.
 * The API key is read ONLY from server-side environment variables.
 * It is never exposed to the browser or returned in any API response.
 */

import OpenAI from "openai";
import type { AIProvider, ChatMessage, CompletionOptions, CompletionResult } from "./provider";

export const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set. " +
        "Add it to .env.local (never commit that file). " +
        "See .env.example for details.",
    );
  }
  return new OpenAI({ apiKey });
}

export class OpenAIProvider implements AIProvider {
  name = "openai";

  async complete(
    messages: ChatMessage[],
    options: CompletionOptions = {},
  ): Promise<CompletionResult> {
    const client = getClient();
    const model = options.model ?? DEFAULT_MODEL;

    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens,
      response_format: options.jsonMode ? { type: "json_object" } : undefined,
    });

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      throw new Error("OpenAI returned an empty response");
    }

    return {
      content: choice.message.content,
      model: response.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }
}

/** Initialize and return the default OpenAI provider */
export function createOpenAIProvider(): OpenAIProvider {
  return new OpenAIProvider();
}
