import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onUserTyping?: () => void;
}

export const ChatInput = ({ onSendMessage, onUserTyping }: ChatInputProps) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const minHeight = 56; // matches min-h-[56px]
      const maxHeight = 24 * 6; // approx 6 lines
      textarea.style.height = 'auto';
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, minHeight),
        maxHeight
      );
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleSendMessage = () => {
    if (content.trim()) {
      onSendMessage(content);
      setContent('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onUserTyping?.();
  };

  useEffect(() => {
    adjustHeight();
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-6 border-t border-gray-700/50 bg-gradient-secondary/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                className="w-full glass p-4 pr-16 rounded-xl text-white resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400 min-h-[56px]"
                rows={1}
                value={content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                {content.length > 0 && `${content.length} chars`}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className={`h-[56px] w-[56px] rounded-xl transition-all duration-200 flex items-center justify-center ${
                  content.trim()
                    ? 'btn-primary shadow-modern'
                    : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleSendMessage}
                disabled={!content.trim()}
                title={content.trim() ? 'Send message' : 'Type a message first'}
                style={{ padding: 0 }} // Remove default padding
              >
                <span className="flex items-center justify-center p-4">
                  <Send size={20} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};