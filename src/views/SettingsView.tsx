import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { db } from '../db';
import type { Agent, Conversation, Message, Setting } from '../types';

const SettingsView: React.FC = () => {
  const {
    openAiApiKey,
    googleApiKey,
    autoAdvance,
    maxAutoAdvance,
    maxContextMessages,
    setOpenAiApiKey,
    setGoogleApiKey,
    setAutoAdvance,
    setMaxAutoAdvance,
    setMaxContextMessages,
    init,
  } = useSettingsStore();

  useEffect(() => {
    init();
  }, [init]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  type ExportData = {
    agents: Agent[];
    conversations: (Omit<Conversation, 'startDate'> & { startDate: string })[];
    messages: (Omit<Message, 'sendTime'> & { sendTime: string })[];
    settings: Setting[];
  };

  const handleExport = async () => {
    const data: ExportData = {
      agents: await db.agents.toArray(),
      conversations: (await db.conversations.toArray()).map((c) => ({
        ...c,
        startDate: c.startDate.toISOString(),
      })),
      messages: (await db.messages.toArray()).map((m) => ({
        ...m,
        sendTime: m.sendTime.toISOString(),
      })),
      settings: await db.settings.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chatmeld-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') throw new Error('Invalid file');
        const data = JSON.parse(text) as ExportData;
        await db.transaction('rw', [
          db.agents,
          db.conversations,
          db.messages,
          db.settings,
        ], async () => {
          await Promise.all([
            db.agents.clear(),
            db.conversations.clear(),
            db.messages.clear(),
            db.settings.clear(),
          ]);
          await db.agents.bulkAdd(data.agents || []);
          await db.conversations.bulkAdd(
            (data.conversations || []).map((c) => ({
              ...c,
              startDate: new Date(c.startDate),
            }))
          );
          await db.messages.bulkAdd(
            (data.messages || []).map((m) => ({
              ...m,
              sendTime: new Date(m.sendTime),
            }))
          );
          await db.settings.bulkAdd(data.settings || []);
        });
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Failed to import data');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    const confirmed = window.confirm(
      'This will remove all chats, agents, and settings. Are you sure?'
    );
    if (confirmed) {
      await db.delete();
      window.location.reload();
    }
  };

  return (
    <div className="p-6 space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold">Settings</h2>
        <p>
          Configure your API keys, adjust conversation behavior, or manage stored data.
          <strong> All data is stored locally in your browser.</strong>
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">API Keys</h3>
        <div className="space-y-2">
          <label htmlFor="openAiApiKey" className="block text-sm font-medium">
            OpenAI API Key
          </label>
          <input
            id="openAiApiKey"
            type="password"
            placeholder="sk-..."
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={openAiApiKey}
            onChange={(e) => setOpenAiApiKey(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="googleApiKey" className="block text-sm font-medium">
            Google AI Studio API Key
          </label>
          <input
            id="googleApiKey"
            type="password"
            placeholder="AIza..."
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={googleApiKey}
            onChange={(e) => setGoogleApiKey(e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Conversation</h3>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoAdvance"
            checked={autoAdvance}
            onChange={(e) => setAutoAdvance(e.target.checked)}
          />
          <label htmlFor="autoAdvance" className="text-sm font-medium">
            Auto-advance conversations
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="maxAutoAdvance" className="text-sm font-medium">
            Max Auto-advance
          </label>
          <input
            type="number"
            id="maxAutoAdvance"
            min={2}
            max={999}
            className="w-20 p-1 rounded bg-gray-700 text-white"
            value={maxAutoAdvance}
            onChange={(e) => setMaxAutoAdvance(Number(e.target.value))}
          />
          <span className="text-sm text-gray-400">
            Consecutive AI messages before auto-advance turns off.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="maxContextMessages" className="text-sm font-medium">
            Max Context Messages
          </label>
          <input
            type="number"
            id="maxContextMessages"
            min={3}
            max={999}
            className="w-20 p-1 rounded bg-gray-700 text-white"
            value={maxContextMessages}
            onChange={(e) => setMaxContextMessages(Number(e.target.value))}
          />
          <span className="text-sm text-gray-400">
            Recent messages included in prompts.
          </span>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Data Management</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-700 text-white"
            onClick={handleExport}
          >
            Export All Data
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-700 text-white"
            onClick={handleImport}
          >
            Import Data
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
            onClick={handleClearData}
          >
            Clear All Local Data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </section>

      <footer>
        <p className="text-sm">
          Manage your{' '}
          <Link to="/agents" className="text-blue-400 hover:underline">
            custom agents
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default SettingsView;
