import { motion } from 'framer-motion';

function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={
          isUser
            ? { background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: 'white' }
            : { backgroundColor: 'var(--bg-secondary)', color: 'var(--primary)' }
        }
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md'
            : 'rounded-bl-md'
        }`}
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                color: 'white'
              }
            : {
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }
        }
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {time && (
          <p
            className="text-[10px] mt-1 opacity-60"
            style={isUser ? { color: 'rgba(255,255,255,0.7)' } : { color: 'var(--text-muted)' }}
          >
            {time}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default ChatMessage;
