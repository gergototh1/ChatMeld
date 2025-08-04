import type { Message } from '../types';

export interface LlmCallParams {
  model: string;
  messages: Pick<Message, 'role' | 'content'>[];
  temperature?: number;
  max_tokens?: number;
  stop?: string[];
}

export interface ApiKeys {
  openAiApiKey?: string;
  googleApiKey?: string;
  [key: string]: string | undefined;
}

export interface LlmModel {
  id: string;
  label: string;
}

export interface LlmProvider {
  id: string;
  apiKeyName: string;
  defaultModel: string;
  models: LlmModel[];
  call: (params: LlmCallParams, apiKey: string) => Promise<string>;
}

const openAiCall = async (
  { model, messages, temperature, max_tokens, stop }: LlmCallParams,
  apiKey: string,
): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      stop,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('LLM API Error:', errorData);
    throw new Error(
      `API request failed with status ${response.status}: ${errorData.error.message}`,
    );
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || '';
};

const geminiCall = async (
  { model, messages, temperature, max_tokens, stop }: LlmCallParams,
  apiKey: string,
): Promise<string> => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body: Record<string, unknown> = {
    contents: messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  };
  if (
    temperature !== undefined ||
    max_tokens !== undefined ||
    (stop && stop.length)
  ) {
    body.generationConfig = {
      ...(temperature !== undefined && { temperature }),
      ...(max_tokens !== undefined && { maxOutputTokens: max_tokens }),
      ...(stop && stop.length ? { stopSequences: stop } : {}),
    };
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('LLM API Error:', errorData);
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
};

export const LLM_PROVIDERS: LlmProvider[] = [
  {
    id: 'openai',
    apiKeyName: 'openAiApiKey',
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o-mini', label: 'gpt-4o-mini' },
      { id: 'gpt-4o', label: 'gpt-4o' },
      { id: 'gpt-4.1-nano', label: 'gpt-4.1-nano' },
      { id: 'gpt-4.1-mini', label: 'gpt-4.1-mini' },
      { id: 'gpt-4.1', label: 'gpt-4.1' },
    ],
    call: openAiCall,
  },
  {
    id: 'gemini',
    apiKeyName: 'googleApiKey',
    defaultModel: 'gemini-2.5-flash-lite',
    models: [
      { id: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite' },
      { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash' },
      { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro' },
    ],
    call: geminiCall,
  },
];
export const DEFAULT_MODEL = LLM_PROVIDERS[0].defaultModel;
export const ALL_MODELS = LLM_PROVIDERS.flatMap((p) => p.models);

const MODEL_PROVIDER_MAP: Record<string, LlmProvider> = {};
for (const provider of LLM_PROVIDERS) {
  for (const model of provider.models) {
    MODEL_PROVIDER_MAP[model.id] = provider;
  }
}

export function getProviderForModel(model: string): LlmProvider | undefined {
  return MODEL_PROVIDER_MAP[model];
}

export function getAvailableModels(apiKeys: ApiKeys): LlmModel[] {
  return LLM_PROVIDERS.filter((p) => apiKeys[p.apiKeyName])
    .flatMap((p) => p.models);
}

export function getDefaultModel(apiKeys: ApiKeys): string {
  for (const provider of LLM_PROVIDERS) {
    const key = apiKeys[provider.apiKeyName];
    if (key) return provider.defaultModel;
  }
  return ALL_MODELS[0]?.id || '';
}
