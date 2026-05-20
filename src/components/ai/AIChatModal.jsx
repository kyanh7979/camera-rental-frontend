import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrash2 } from 'react-icons/fi';
import ChatMessage from './ChatMessage.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import SuggestionChips from './SuggestionChips.jsx';
import ChatInput from './ChatInput.jsx';
import useAIChat from '../../hooks/useAIChat.js';

function AIChatModal({ isOpen, onClose }) {
  const { messages, isTyping, isLoading, hasAI, cooldownRemaining, sendMessage, clearChat } = useAIChat();
  const messagesEndRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Handle send - wrap in try-catch for safety
  const handleSend = useCallback((text) => {
    try {
      sendMessage(text);
    } catch (err) {
      console.error('[AI Chat Modal] Error in handleSend:', err);
    }
  }, [sendMessage]);

  // Handle suggestion click - same as handleSend
  const handleSuggestion = useCallback((text) => {
    handleSend(text);
  }, [handleSend]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      // Reset any local state if needed
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-[700px] h-[80vh] rounded-3xl flex flex-col overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
                }}
              >
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                  AI Assistant
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Tu van thue may anh
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cooldownRemaining > 0 && (
                <span 
                  className="text-xs px-2 py-1 rounded-full animate-pulse"
                  style={{ 
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}
                >
                  ⏳ {cooldownRemaining}s
                </span>
              )}
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-2 rounded-xl transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-muted)'
                  }}
                  title="Xoa lich su chat"
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-colors cursor-pointer"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
            style={{ scrollBehavior: 'smooth' }}
            onScroll={handleScroll}
          >
            {!hasAI && (
              <div
                className="text-center py-4 px-4 rounded-xl text-sm"
                style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.2)',
                  color: 'var(--text-secondary)'
                }}
              >
                Dich vu AI dang bao tri. Vui long thu lai sau.
              </div>
            )}

            {messages.length === 0 && hasAI && (
              <div className="text-center space-y-4 py-6">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(8, 145, 178, 0.1))',
                    border: '1px solid rgba(6, 182, 212, 0.2)'
                  }}
                >
                  <span className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                    AI
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                    Xin chao! Minh la tro ly AI cua LensRent
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Minh co the tu van may anh, lens, combo vlog...
                  </p>
                </div>
                <div className="flex justify-center">
                  <SuggestionChips onSuggestion={handleSuggestion} disabled={isLoading || isTyping} />
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessage key={msg.id || i} message={msg} />
            ))}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions bar (when has messages) */}
          {messages.length > 0 && (
            <div
              className="px-6 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <SuggestionChips onSuggestion={handleSuggestion} disabled={isLoading || isTyping} />
            </div>
          )}

          {/* Input */}
          <div
            className="px-6 py-4 flex-shrink-0"
            style={{ borderTop: '1px solid var(--border-color)' }}
          >
            <ChatInput onSend={handleSend} disabled={isTyping || !hasAI} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AIChatModal;
