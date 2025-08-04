import { useState } from 'react';
import type { Message } from '../../types';
import { useAgentStore } from '../../store/agentStore';
import { useMessageStore } from '../../store/messageStore';
import { MoreVertical, Pencil, Trash2, X, Check, Copy } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.agentId === 'user';
  const { presetAgents, customAgents } = useAgentStore();
  const { updateMessage, deleteMessage } = useMessageStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const agent = isUser
    ? null
    : [...presetAgents, ...customAgents].find((a) => a.id === message.agentId);

  const agentName = agent?.name ?? 'Agent';

  const handleSave = async () => {
    await updateMessage(message.id, { content: editContent });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteMessage(message.id);
  };

  return (
    <div className={`flex gap-4 my-6 ${isUser ? 'justify-end' : ''}`}
      onMouseLeave={() => setMenuOpen(false)}>
      {!isUser && (
        <div className="flex-shrink-0">
          <Avatar name={agentName} size={44} />
        </div>
      )}
      <div
        className={`relative ${isEditing ? 'w-full max-w-3xl' : 'max-w-2xl'} ${
          isUser ? 'order-first' : ''
        }`}
      >
        <div className={`card-hover p-4 ${
          isUser 
            ? 'bg-gradient-accent text-white ml-12' 
            : 'glass-light text-gray-100'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="font-semibold text-sm opacity-90">
              {isUser ? 'You' : agentName}
            </span>
            <button
              className={`p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity ${
                isUser ? 'hover:bg-white/10' : 'hover:bg-gray-600/50'
              }`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical size={16} />
            </button>
          </div>
          
          {menuOpen && (
            <div className="absolute right-0 top-12 w-32 card p-1 z-20">
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-600/50 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(message.content);
                  setMenuOpen(false);
                }}
              >
                <Copy size={14} /> Copy
              </button>
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-600/50 transition-colors"
                onClick={() => {
                  setIsEditing(true);
                  setMenuOpen(false);
                }}
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                onClick={handleDelete}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
          
          {isEditing ? (
            <div className="mt-3">
              <textarea
                className="w-full glass p-3 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                placeholder="Edit your message..."
              />
              <div className="flex gap-2 justify-end mt-3">
                <button
                  className="p-2 rounded-lg bg-gray-600/50 hover:bg-gray-600 transition-colors"
                  onClick={() => setIsEditing(false)}
                  title="Cancel"
                >
                  <X size={16} />
                </button>
                <button
                  className="p-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
                  onClick={handleSave}
                  title="Save"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};