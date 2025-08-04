import { useRef, useState } from 'react';
import type { Agent } from '../types';
import { Check } from 'lucide-react';

interface AgentMultiSelectProps {
  agents: Agent[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  maxSelect?: number;
}

const AgentMultiSelect = ({ agents, selectedIds, onToggle, maxSelect = 4 }: AgentMultiSelectProps) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  const filtered = agents
    .filter((a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.description.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const grouped = filtered.reduce<Record<string, Agent[]>>((acc, agent) => {
    const cat = agent.id > 0 ? 'Custom Agents' : agent.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(agent);
    return acc;
  }, {});

  const handleToggle = (id: number) => {
    onToggle(id);
    setQuery('');
  };

  return (
    <div className="space-y-2">
      {selectedIds.length < (maxSelect ?? 4) && (
        <div className="relative" ref={wrapperRef} onFocus={() => setOpen(true)} onBlur={handleBlur}>
          <input
            type="text"
            placeholder="Select agents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded"
          />
          {open && filtered.length > 0 && (
            <ul className="absolute z-10 bg-gray-800 w-full mt-1 max-h-48 overflow-y-auto rounded shadow-lg p-1 space-y-1">
              {Object.entries(grouped)
                .sort(([a], [b]) => {
                  if (a === 'Custom Agents') return -1;
                  if (b === 'Custom Agents') return 1;
                  return 0;
                })
                .map(([category, items]) => (
                <li key={category} className="mb-1 last:mb-0">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">{category}</div>
                  <ul>
                    {items.map((agent) => (
                      <li
                        key={agent.id}
                        className="p-2 hover:bg-gray-700 cursor-pointer flex justify-between"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleToggle(agent.id)}
                      >
                        <span>{agent.name}</span>
                        {selectedIds.includes(agent.id) && <Check size={16} />}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {selectedIds.map((id) => {
          const agent = agents.find((a) => a.id === id);
          if (!agent) return null;
          return (
            <span
              key={id}
              className="bg-blue-700 text-sm px-2 py-1 rounded flex items-center gap-1"
            >
              {agent.name}
              <button
                className="ml-1 text-gray-300 hover:text-white"
                onClick={() => onToggle(id)}
              >
                &times;
              </button>
            </span>
          );
        })}
      </div>
      <p className="text-sm text-gray-400">Select up to {maxSelect} agents.</p>
    </div>
  );
};

export default AgentMultiSelect;
