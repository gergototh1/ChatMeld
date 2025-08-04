import { create } from 'zustand';
import { db } from '../db';
import type { Conversation, ConversationAgentSettings } from '../types/index.ts';

interface ConversationState {
  conversations: Conversation[];
  fetchConversations: () => Promise<void>;
  addConversation: (conversation: Omit<Conversation, 'id' | 'startDate'>) => Promise<Conversation>;
  deleteConversation: (id: number) => Promise<void>;
  updateConversation: (id: number, updates: Partial<Conversation>) => Promise<void>;
  updateConversationAgentSettings: (
    conversationId: number,
    agentId: number,
    updates: Partial<ConversationAgentSettings>,
  ) => Promise<void>;
}

export const useConversationStore = create<ConversationState>()((set) => ({
  conversations: [],
  fetchConversations: async () => {
    const conversations = await db.conversations.toArray();
    conversations.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    set({ conversations });
  },
  addConversation: async (newConversationData) => {
    const startDate = new Date();
    const newConversation = {
      ...newConversationData,
      startDate,
    } as Conversation;
    const id = await db.conversations.add(newConversation);
    const finalConversation = { ...newConversation, id };
    set((state) => ({
      conversations: [...state.conversations, finalConversation],
    }));
    return finalConversation;
  },
  deleteConversation: async (id) => {
    await db.conversations.delete(id);
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== id),
    }));
  },
  updateConversation: async (id, updates) => {
    await db.conversations.update(id, updates);
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv,
      ),
    }));
  },
  updateConversationAgentSettings: async (conversationId, agentId, updates) => {
    const conversation = await db.conversations.get(conversationId);
    if (!conversation) return;

    const existingSettings = conversation.agentSettings || [];
    const settingIndex = existingSettings.findIndex(
      (setting) => setting.agentId === agentId,
    );

    let newAgentSettings;
    if (settingIndex > -1) {
      // Update existing settings
      newAgentSettings = existingSettings.map((setting, index) =>
        index === settingIndex ? { ...setting, ...updates } : setting,
      );
    } else {
      // Add new settings
      newAgentSettings = [...existingSettings, { agentId, ...updates }];
    }

    const updatedConversation = {
      ...conversation,
      agentSettings: newAgentSettings,
    };

    await db.conversations.put(updatedConversation);

    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? updatedConversation : conv,
      ),
    }));
  },
}));
