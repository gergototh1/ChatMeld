import Dexie from 'dexie';
import type { Agent, Conversation, Message, Setting } from '../types';

export class ChatMeldDB extends Dexie {
  agents!: Dexie.Table<Agent>;
  conversations!: Dexie.Table<Conversation>;
  messages!: Dexie.Table<Message>;
  settings!: Dexie.Table<Setting>;

  constructor() {
    super('ChatMeldDB');
    this.version(1).stores({
      agents: '++id, name',
      conversations: '++id, title, startDate',
      messages: '++id, conversationId, sendTime, previousMessageId'
    });
    this.version(2).stores({
      settings: '&key'
    });
  }
}

export const db = new ChatMeldDB();
