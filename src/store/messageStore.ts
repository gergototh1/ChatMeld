import { create } from 'zustand';
import { db } from '../db';
import type { Message } from '../types';

interface MessageState {
  messages: Message[];
  fetchMessages: (conversationId: number) => Promise<void>;
  addMessage: (message: Omit<Message, 'id' | 'sendTime'>) => Promise<Message>;
  updateMessage: (id: number, updates: Partial<Message>) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
  clearMessages: (conversationId: number) => Promise<void>;
}

export const useMessageStore = create<MessageState>()((set) => ({
  messages: [],
  fetchMessages: async (conversationId) => {
    const messages = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('sendTime');
    set({ messages });
  },
  addMessage: async (message) => {
    const sendTime = new Date();
    const role = message.agentId === 'user' ? 'user' : 'assistant';
    const newMessage = { ...message, role, sendTime } as Message;
    const id = await db.messages.add(newMessage);
    const finalMessage = { ...newMessage, id };
    set((state) => ({ messages: [...state.messages, finalMessage] }));
    return finalMessage;
  },
  updateMessage: async (id, updates) => {
    await db.messages.update(id, updates);
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },
  deleteMessage: async (id) => {
    await db.messages.delete(id);
    set((state) => ({ messages: state.messages.filter((m) => m.id !== id) }));
  },
  clearMessages: async (conversationId) => {
    await db.messages.where('conversationId').equals(conversationId).delete();
    set({ messages: [] });
  },
}));
