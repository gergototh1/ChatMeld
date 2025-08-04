import {
  ChevronDown,
  ChevronUp,
  Megaphone,
  Play,
  Trash2,
  ArrowLeft,
  Pause,
  Dice5,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Avatar } from '../ui/Avatar';
import type { Agent } from '../../types';
import { useChatStore } from '../../store/chatStore';
import type { useChatConductor } from '../../hooks/useChatConductor';
import { useMessageStore } from '../../store/messageStore';
import { useSettingsStore } from '../../store/settingsStore';
import { presetTraits } from '../../lib/presetTraits';
import { getAvailableModels, getDefaultModel, type LlmModel } from '../../lib/llm-providers';
const AgentCard = ({
  agent,
  onForceTurn,
  availableModels,
  defaultModel,
  settingsInitialized,
}: {
  agent: Agent;
  onForceTurn: (agentId: number) => void;
  availableModels: LlmModel[];
  defaultModel: string;
  settingsInitialized: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [traits, setTraits] = useState(agent.traits || '');
  const [temperature, setTemperature] = useState(
    agent.temperature || agent.defaultTemperature,
  );
  const { updateActiveConversationAgentSettings } = useChatStore();

  const handleLoadRandomTrait = () => {
    const randomTrait = presetTraits[Math.floor(Math.random() * presetTraits.length)];
    setTraits(randomTrait);
    updateActiveConversationAgentSettings(agent.id, { traits: randomTrait });
  };

  const currentModel = agent.model || agent.defaultModel;
  const modelValue = settingsInitialized
    ? availableModels.some((m) => m.id === currentModel)
      ? currentModel
      : defaultModel
    : currentModel;

  useEffect(() => {
    if (settingsInitialized && modelValue !== currentModel) {
      updateActiveConversationAgentSettings(agent.id, { model: modelValue });
    }
  }, [settingsInitialized, modelValue, currentModel, agent.id, updateActiveConversationAgentSettings]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateActiveConversationAgentSettings(agent.id, { model: e.target.value });
  };

  const handleTraitsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTraits(e.target.value);
  };

  const handleTraitsBlur = () => {
    updateActiveConversationAgentSettings(agent.id, { traits: traits });
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTemp = parseFloat(e.target.value);
    setTemperature(newTemp);
    updateActiveConversationAgentSettings(agent.id, { temperature: newTemp });
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={agent.name} size={40} />
          <div>
            <div className="font-bold truncate max-w-[120px] text-white">{agent.name}</div>
            <div className="relative">
              <select
                className="text-sm max-w-[100px] text-gray-400 bg-transparent appearance-none pr-6 cursor-pointer focus:outline-none focus:ring-0"
                value={modelValue}
                onChange={handleModelChange}
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 transition-colors"
            onClick={() => onForceTurn(agent.id)}
            title="Force this agent to speak next"
          >
            <Megaphone size={18} />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Description</h4>
            <p className="text-sm text-gray-400">{agent.description}</p>
          </div>
          <div className="relative">
            <h4 className="font-semibold text-sm mb-1">Traits</h4>
            <button
              type="button"
              className="absolute -top-2 right-0 p-1 rounded hover:bg-gray-700"
              onClick={handleLoadRandomTrait}
            >
              <Dice5 size={16} />
            </button>
            <textarea
              className="w-full p-2 rounded bg-gray-700 text-white text-sm resize-none"
              rows={3}
              value={traits}
              onChange={handleTraitsChange}
              onBlur={handleTraitsBlur}
            />
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Temperature</h4>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={temperature}
                onChange={handleTemperatureChange}
                className="w-full"
              />
              <span className="text-sm font-mono">{temperature.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ConversationInfoPanel = () => {
  const { activeConversation } = useChatStore();
  const { messages } = useMessageStore();
  const { autoAdvance } = useSettingsStore();

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="font-bold mb-4">Conversation Info</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>ID:</span>
          <span>{activeConversation?.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Start Date:</span>
          <span>{activeConversation?.startDate.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Messages:</span>
          <span>{messages.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Auto-advance:</span>
          <span className={autoAdvance ? 'text-green-400' : 'text-red-400'}>
            {autoAdvance ? 'On' : 'Off'}
          </span>
        </div>
      </div>
    </div>
  );
};

const ActionsPanel = ({ conversationId }: { conversationId: number }) => {
  const { clearMessages } = useMessageStore();
  const { autoAdvance, setAutoAdvance } = useSettingsStore();
  const handleRestart = () => {
    clearMessages(conversationId);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="font-bold mb-4">Actions</h3>
      <div className="flex flex-col gap-2">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600"
          onClick={() => setAutoAdvance(!autoAdvance)}
        >
          {autoAdvance ? (
            <>
              <Pause size={16} />
              <span>Disable Auto-advance</span>
            </>
          ) : (
            <>
              <Play size={16} />
              <span>Enable Auto-advance</span>
            </>
          )}
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600"
          onClick={handleRestart}
        >
          <Trash2 size={16} />
          <span>Restart Conversation</span>
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600"
        >
          <ArrowLeft size={16} />
          <span>Back to Conversations</span>
        </Link>
      </div>
    </div>
  );
};

export const ChatSidebar = ({ conversationId, conductor, onClose }: { conversationId: number; conductor: ReturnType<typeof useChatConductor>; onClose?: () => void }) => {
  const { activeConversation } = useChatStore();
  const { openAiApiKey, googleApiKey, initialized } = useSettingsStore();
  const apiKeys = { openAiApiKey, googleApiKey };
  const availableModels = getAvailableModels(apiKeys);
  const defaultModel = getDefaultModel(apiKeys);

  return (
    <div className="w-80 bg-gradient-secondary text-white p-6 space-y-6 overflow-y-auto h-full shadow-modern-lg">
      <div className="md:hidden flex justify-end">
        <button
          className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <div className="space-y-4">
        {activeConversation &&
          activeConversation.agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onForceTurn={conductor.forceTurn}
                availableModels={availableModels}
                defaultModel={defaultModel}
                settingsInitialized={initialized}
              />
            ))}
      </div>
      {conductor && <ConversationInfoPanel key={conversationId} />}
      {conductor && <ActionsPanel conversationId={conversationId} />}
    </div>
  );
};