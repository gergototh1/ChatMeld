export interface Agent {
  id: number;
  name: string;
  description: string;
  avatarUrl?: string;
  defaultModel: string;
  defaultTemperature: number;
  model?: string;
  temperature?: number;
  language: string;
  traits?: string;
  muted?: boolean;
  category?: string;
  sortOrder?: number;
}

export interface ConversationAgentSettings {
  agentId: number;
  model?: string;
  temperature?: number;
  traits?: string;
  muted?: boolean;
}

export interface Conversation {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  lastMessageId?: number;
  nextSpeakerId?: number;
  language: string;
  agents: Agent[];
  agentSettings?: ConversationAgentSettings[];
}

export interface Message {
  id: number;
  conversationId: number;
  agentId: number | 'user';
  content: string;
  role?: 'user' | 'assistant';
  sendTime: Date;
  previousMessageId?: number;
  loved?: boolean;
  deleted?: boolean;
}

export interface Setting {
  key: string;
  value: string;
}
