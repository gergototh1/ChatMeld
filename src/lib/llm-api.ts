// src/lib/llm-api.ts
import type { Message } from '../types';
import { getProviderForModel, type ApiKeys } from './llm-providers';

interface LlmApiOptions {
  model: string;
  messages: Pick<Message, 'role' | 'content'>[];
  temperature?: number;
  max_tokens?: number;
  stop?: string[];
  apiKeys: ApiKeys;
}

export async function callLlmApi(options: LlmApiOptions): Promise<string> {
  const {
    model,
    messages,
    temperature = 0.7,
    max_tokens = 4000,
    stop,
    apiKeys,
  } = options;

  const provider = getProviderForModel(model);
  if (!provider) {
    throw new Error(`Unsupported model: ${model}`);
  }

  const apiKey = apiKeys[provider.apiKeyName];
  if (!apiKey) {
    throw new Error('API key is missing.');
  }

  try {
    return await provider.call(
      { model, messages, temperature, max_tokens, stop },
      apiKey,
    );
  } catch (error) {
    console.error('Failed to call LLM API:', error);
    return '';
  }
}
