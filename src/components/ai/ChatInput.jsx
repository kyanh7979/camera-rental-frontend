import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập tin nhắn..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          maxHeight: '120px',
          minHeight: '48px'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--primary)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-color)';
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 hover:scale-105 cursor-pointer"
        style={{
          background: disabled || !value.trim()
            ? 'var(--bg-secondary)'
            : 'linear-gradient(135deg, #06b6d4, #0891b2)',
          color: 'white',
          boxShadow: disabled || !value.trim()
            ? 'none'
            : '0 4px 14px rgba(6, 182, 212, 0.3)'
        }}
      >
        <FiSend className="w-4 h-4" />
      </button>
    </div>
  );
}

export default ChatInput;
