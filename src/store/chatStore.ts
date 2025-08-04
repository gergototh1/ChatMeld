import { create } from 'zustand';
import type { Conversation, ConversationAgentSettings } from '../types';
import { useConversationStore } from './conversationStore';

interface ChatState {
  activeConversationId: number | null;
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation | null) => void;
  updateActiveConversationAgentSettings: (
    agentId: number,
    updates: Partial<ConversationAgentSettings>,
  ) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  activeConversation: null,
  setActiveConversation: (conversation: Conversation | null) => {
    if (!conversation) {
      set({ activeConversationId: null, activeConversation: null });
      return;
    }

    const effectiveAgents = conversation.agents.map((baseAgent) => {
      const settings = conversation.agentSettings?.find(
        (s) => s.agentId === baseAgent.id,
      );
      return {
        ...baseAgent,
        ...(settings || {}),
      };
    });

    set({
      activeConversationId: conversation.id,
      activeConversation: { ...conversation, agents: effectiveAgents },
    });
  },
  updateActiveConversationAgentSettings: (agentId, updates) => {
    set((state) => {
      if (!state.activeConversation) return state;

      const existingSettings = state.activeConversation.agentSettings || [];
      const settingIndex = existingSettings.findIndex(
        (setting) => setting.agentId === agentId,
      );

      let newAgentSettings;
      if (settingIndex > -1) {
        newAgentSettings = existingSettings.map((setting, index) =>
          index === settingIndex ? { ...setting, ...updates } : setting,
        );
      } else {
        newAgentSettings = [...existingSettings, { agentId, ...updates }];
      }

      // Persist changes to conversationStore
      useConversationStore.getState().updateConversationAgentSettings(
        state.activeConversation.id,
        agentId,
        updates,
      );

      // Re-derive effective agents based on updated settings
      const effectiveAgents = state.activeConversation.agents.map((baseAgent) => {
        const settings = newAgentSettings.find((s) => s.agentId === baseAgent.id);
        return {
          ...baseAgent,
          ...(settings || {}),
        };
      });

      return {
        activeConversation: {
          ...state.activeConversation,
          agentSettings: newAgentSettings,
          agents: effectiveAgents, // Update agents array with effective properties
        },
      };
    });
  },
}));
