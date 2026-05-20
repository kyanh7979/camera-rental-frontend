import { useEffect, useRef, useState } from 'react';

/**
 * Floating AI Chat Button
 * Premium design with idle glow, hover effects, and periodic wave animation
 */
function FloatingAIButton({ onClick }) {
  const buttonRef = useRef(null);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const DRAG_THRESHOLD = 5;
  const [isWaving, setIsWaving] = useState(false);

  // Wave animation every ~5 seconds
  useEffect(() => {
    const waveInterval = setInterval(() => {
      if (!isDragging.current && buttonRef.current) {
        setIsWaving(true);
        buttonRef.current.classList.add('waving');
        
        setTimeout(() => {
          setIsWaving(false);
          if (buttonRef.current) {
            buttonRef.current.classList.remove('waving');
          }
        }, 800);
      }
    }, 5000);

    return () => clearInterval(waveInterval);
  }, []);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    // Load saved position
    const loadPosition = () => {
      try {
        const stored = localStorage.getItem('chat-launcher-position');
        if (stored) {
          const pos = JSON.parse(stored);
          return pos;
        }
      } catch {}
      return { x: -16, y: -100 };
    };

    const savePosition = (x, y) => {
      try {
        const maxX = window.innerWidth - button.offsetWidth;
        const maxY = window.innerHeight - button.offsetHeight;
        const clampedX = Math.max(0, Math.min(x, maxX));
        const clampedY = Math.max(0, Math.min(y, maxY));
        localStorage.setItem('chat-launcher-position', JSON.stringify({ x: clampedX, y: clampedY }));
      } catch {}
    };

    const position = loadPosition();

    if (position.x >= 0) {
      button.style.left = `${position.x}px`;
      button.style.top = `${position.y}px`;
      button.style.right = 'auto';
      button.style.bottom = 'auto';
    } else {
      button.style.right = `${Math.abs(position.x)}px`;
      button.style.bottom = `${Math.abs(position.y)}px`;
    }

    // Mouse events
    const handleMouseDown = (e) => {
      if (e.button !== 0) return;
      isDragging.current = true;
      hasMoved.current = false;
      button.style.right = 'auto';
      button.style.bottom = 'auto';

      const rect = button.getBoundingClientRect();
      currentPos.current = { x: rect.left, y: rect.top };
      startPos.current = { x: e.clientX, y: e.clientY };

      e.preventDefault();
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      if (!hasMoved.current && (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD)) {
        hasMoved.current = true;
      }

      currentPos.current.x += deltaX;
      currentPos.current.y += deltaY;
      startPos.current = { x: e.clientX, y: e.clientY };

      button.style.left = `${currentPos.current.x}px`;
      button.style.top = `${currentPos.current.y}px`;
    };

    const handleMouseUp = () => {
      if (isDragging.current && hasMoved.current) {
        savePosition(currentPos.current.x, currentPos.current.y);
      }
      isDragging.current = false;
      hasMoved.current = false;
    };

    // Touch events
    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      isDragging.current = true;
      hasMoved.current = false;
      button.style.right = 'auto';
      button.style.bottom = 'auto';

      const rect = button.getBoundingClientRect();
      currentPos.current = { x: rect.left, y: rect.top };
      startPos.current = { x: touch.clientX, y: touch.clientY };

      e.preventDefault();
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const touch = e.touches[0];

      const deltaX = touch.clientX - startPos.current.x;
      const deltaY = touch.clientY - startPos.current.y;

      if (!hasMoved.current && (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD)) {
        hasMoved.current = true;
      }

      currentPos.current.x += deltaX;
      currentPos.current.y += deltaY;
      startPos.current = { x: touch.clientX, y: touch.clientY };

      button.style.left = `${currentPos.current.x}px`;
      button.style.top = `${currentPos.current.y}px`;

      e.preventDefault();
    };

    const handleTouchEnd = () => {
      if (isDragging.current && hasMoved.current) {
        savePosition(currentPos.current.x, currentPos.current.y);
      }
      isDragging.current = false;
      hasMoved.current = false;
    };

    // Click handler
    const handleClick = (e) => {
      // Only trigger if user intentionally tapped (not dragged)
      if (hasMoved.current) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      button.classList.add('clicked');
      setTimeout(() => button.classList.remove('clicked'), 600);
      onClick?.();
    };

    // Add listeners
    button.addEventListener('mousedown', handleMouseDown);
    button.addEventListener('touchstart', handleTouchStart, { passive: false });
    button.addEventListener('click', handleClick);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      button.removeEventListener('mousedown', handleMouseDown);
      button.removeEventListener('touchstart', handleTouchStart);
      button.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div
      ref={buttonRef}
      className="chat-launcher"
      style={{
        right: -16,
        bottom: -100,
      }}
    >
      <button
        type="button"
        className="chat-launcher-btn"
        aria-label="Mở chat AI"
        title="AI hỗ trợ thuê máy ảnh"
      >
        {/* Pulse Glow */}
        <div className="chat-launcher-glow" />

        {/* Ripple Effect */}
        <div className="chat-launcher-ripple" />

        {/* Custom SVG Icon - Futuristic AI Robot */}
        <svg
          className="chat-launcher-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
            </linearGradient>
            <filter id="iconGlow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Robot Head */}
          <rect
            x="4"
            y="5"
            width="16"
            height="12"
            rx="3"
            stroke="url(#iconGradient)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#iconGlow)"
          />
          {/* Antenna */}
          <line x1="12" y1="2" x2="12" y2="5" stroke="url(#iconGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="1.5" r="1" fill="#22d3ee" />
          {/* Eyes */}
          <circle cx="8.5" cy="10" r="1.5" fill="#22d3ee" />
          <circle cx="15.5" cy="10" r="1.5" fill="#22d3ee" />
          {/* Mouth/Chip */}
          <rect x="8" y="13.5" width="8" height="1.5" rx="0.5" fill="#22d3ee" opacity="0.7" />
          {/* Ears */}
          <rect x="2" y="8" width="2" height="3" rx="0.5" stroke="url(#iconGradient)" strokeWidth="1" fill="none" />
          <rect x="20" y="8" width="2" height="3" rx="0.5" stroke="url(#iconGradient)" strokeWidth="1" fill="none" />
        </svg>
      </button>

      {/* Loading Ring */}
      <div className="chat-launcher-ring" />

      {/* Tooltip */}
      <div className="chat-launcher-tooltip">
        <div className="chat-launcher-tooltip-content">
          <span className="chat-launcher-tooltip-title">AI Assistant</span>
          <span className="chat-launcher-tooltip-desc">Trợ lý thuê máy ảnh</span>
        </div>
      </div>
    </div>
  );
}

export default FloatingAIButton;
