import React, { useEffect, useState, useMemo } from 'react';
import type { Agent } from '../types';
import { useAgentStore } from '../store/agentStore';
import { getAvailableModels, getDefaultModel } from '../lib/llm-providers';
import { useSettingsStore } from '../store/settingsStore';

const AgentsView: React.FC = () => {
  const {
    presetAgents,
    customAgents,
    fetchCustomAgents,
    addCustomAgent,
    deleteCustomAgent,
    updateAgent,
  } = useAgentStore();
  const { openAiApiKey, googleApiKey, initialized } = useSettingsStore();
  const apiKeys = useMemo(
    () => ({ openAiApiKey, googleApiKey }),
    [openAiApiKey, googleApiKey],
  );
  const availableModels = useMemo(
    () => getAvailableModels(apiKeys),
    [apiKeys],
  );
  const defaultModel = useMemo(
    () => getDefaultModel(apiKeys),
    [apiKeys],
  );
  const emptyAgent: Omit<Agent, 'id'> = useMemo(
    () => ({
      name: '',
      description: '',
      defaultModel,
      defaultTemperature: 0.7,
      language: 'en',
      category: 'Custom',
    }),
    [defaultModel],
  );

  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('custom');
  const [formData, setFormData] = useState<Omit<Agent, 'id'>>(emptyAgent);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!availableModels.some((m) => m.id === formData.defaultModel)) {
      setFormData((prev) =>
        prev.defaultModel === defaultModel ? prev : { ...prev, defaultModel },
      );
    }
  }, [initialized, availableModels, defaultModel, formData.defaultModel]);

  useEffect(() => {
    fetchCustomAgents();
  }, [fetchCustomAgents]);

  const startNew = () => {
    setFormData(emptyAgent);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (agent: Agent) => {
    const model =
      initialized && availableModels.some((m) => m.id === agent.defaultModel)
        ? agent.defaultModel
        : defaultModel;
    setFormData({
      name: agent.name,
      description: agent.description,
      defaultModel: model,
      defaultTemperature: agent.defaultTemperature,
      language: agent.language,
      category: agent.category,
    });
    setEditingId(agent.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (editingId !== null) {
      await updateAgent(editingId, formData);
    } else {
      await addCustomAgent(formData);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyAgent);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold">Agent Management</h2>
      <div className="flex gap-4 mt-4">
        <button
          className={`px-3 py-1 rounded ${activeTab === 'custom' ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => setActiveTab('custom')}
        >
          My Custom Agents
        </button>
        <button
          className={`px-3 py-1 rounded ${activeTab === 'presets' ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => setActiveTab('presets')}
        >
          Preset Agents
        </button>
      </div>

      {activeTab === 'custom' && (
        <div className="space-y-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            onClick={startNew}
          >
            Create New Agent
          </button>

          {showForm && (
            <div className="bg-gray-800 p-4 rounded space-y-3">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  className="w-full p-2 rounded bg-gray-700"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea
                  className="w-full p-2 rounded bg-gray-700"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Default Model</label>
                <select
                  className="w-full p-2 rounded bg-gray-700"
                  value={formData.defaultModel}
                  onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Default Temperature</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  className="w-full p-2 rounded bg-gray-700"
                  value={formData.defaultTemperature}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultTemperature: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  onClick={handleSubmit}
                >
                  Save
                </button>
                <button
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {customAgents.length === 0 && <p className="text-gray-400">No custom agents yet.</p>}
            {customAgents.map((agent) => (
              <div key={agent.id} className="bg-gray-800 p-4 rounded flex justify-between items-start">
                <div>
                  <div className="font-semibold">{agent.name}</div>
                  <p className="text-sm text-gray-400">{agent.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                    onClick={() => startEdit(agent)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
                    onClick={() => deleteCustomAgent(agent.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'presets' && (
        <div className="space-y-2">
          {presetAgents.map((agent) => (
            <div key={agent.id} className="bg-gray-800 p-4 rounded">
              <div className="font-semibold">{agent.name}</div>
              <p className="text-sm text-gray-400">{agent.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentsView;
