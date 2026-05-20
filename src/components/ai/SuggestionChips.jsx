/**
 * SuggestionChips — quick action buttons for AI chat
 * 
 * Features:
 * - Click to send suggestion
 * - Cooldown after click (3 seconds)
 * - Disable when loading
 * - Visual feedback during cooldown
 */

import { useState } from 'react';

const SUGGESTIONS = [
  'Máy ảnh cho người mới bắt đầu',
  'Combo quay Vlog chuyên nghiệp',
  'Máy chụp chân dung đẹp',
  'Tư vấn dưới 1 triệu/ngày',
  'Lens quay video chất lượng'
];

const COOLDOWN_MS = 3000;

function SuggestionChips({ onSuggestion, disabled }) {
  const [cooldownActive, setCooldownActive] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleClick = (text) => {
    // Don't allow click during cooldown
    if (cooldownActive || disabled) {
      console.log('[AI Chat] Suggestion blocked: cooldown or disabled');
      return;
    }

    console.log('[AI Chat] Suggestion clicked:', text);
    
    // Start cooldown
    setCooldownActive(true);
    setCountdown(Math.ceil(COOLDOWN_MS / 1000));
    
    // Call the suggestion handler
    onSuggestion(text);
    
    // Countdown timer
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCooldownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isDisabled = disabled || cooldownActive;

  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTIONS.map((text, index) => (
        <button
          key={`suggestion-${index}-${text.substring(0, 10)}`}
          onClick={() => handleClick(text)}
          disabled={isDisabled}
          className={`
            px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
          `}
          style={{
            backgroundColor: cooldownActive 
              ? 'rgba(245, 158, 11, 0.1)' 
              : 'rgba(6, 182, 212, 0.08)',
            border: `1px solid ${cooldownActive 
              ? 'rgba(245, 158, 11, 0.3)' 
              : 'rgba(6, 182, 212, 0.2)'}`,
            color: cooldownActive ? '#f59e0b' : 'var(--primary)'
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.backgroundColor = cooldownActive 
                ? 'rgba(245, 158, 11, 0.1)' 
                : 'rgba(6, 182, 212, 0.08)';
              e.currentTarget.style.borderColor = cooldownActive 
                ? 'rgba(245, 158, 11, 0.3)' 
                : 'rgba(6, 182, 212, 0.2)';
            }
          }}
        >
          {cooldownActive && countdown > 0 ? (
            <span className="flex items-center gap-1">
              <span className="inline-block animate-pulse">⏳</span>
              {text.substring(0, 15)}...
            </span>
          ) : (
            text
          )}
        </button>
      ))}
    </div>
  );
}

export default SuggestionChips;
