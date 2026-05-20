/**
 * FUTURISTIC CHAT LAUNCHER BUTTON
 * Drag, Position, Animation Logic
 */

(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    storageKey: 'chat-launcher-position',
    defaultX: -16,
    defaultY: -100,
    dragThreshold: 5, // pixels moved to detect drag vs click
    animationDelay: 500, // ms before showing loading state
  };

  class ChatLauncher {
    constructor() {
      this.element = null;
      this.isDragging = false;
      this.hasMoved = false;
      this.startX = 0;
      this.startY = 0;
      this.currentX = 0;
      this.currentY = 0;
      this.isInitialized = false;

      this.init();
    }

    init() {
      // Wait for DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.create());
      } else {
        this.create();
      }
    }

    create() {
      if (this.isInitialized) return;

      // Create container
      this.element = document.createElement('div');
      this.element.className = 'chat-launcher entering';
      this.element.innerHTML = this.getHTML();

      // Load saved position
      const position = this.loadPosition();
      this.currentX = position.x;
      this.currentY = position.y;

      // Apply initial position
      this.applyPosition();

      // Append to body
      document.body.appendChild(this.element);

      // Setup event listeners
      this.setupDrag();
      this.setupClick();
      this.setupTouch();

      // Remove entrance animation class after animation
      setTimeout(() => {
        this.element.classList.remove('entering');
      }, 600);

      this.isInitialized = true;
    }

    getHTML() {
      return `
        <button class="chat-launcher-btn" type="button" aria-label="Mở chat AI" title="AI hỗ trợ thuê máy ảnh">
          <!-- Pulse Glow -->
          <div class="chat-launcher-glow"></div>

          <!-- Ripple Effect -->
          <div class="chat-launcher-ripple"></div>

          <!-- Custom SVG Icon -->
          <svg class="chat-launcher-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- Robot Head -->
            <rect x="4" y="5" width="16" height="12" rx="3" stroke="url(#iconGradient)" stroke-width="1.5" fill="none" filter="url(#glow)"/>
            <!-- Antenna -->
            <line x1="12" y1="2" x2="12" y2="5" stroke="url(#iconGradient)" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="12" cy="1.5" r="1" fill="#22d3ee" filter="url(#glow)"/>
            <!-- Eyes -->
            <circle cx="8.5" cy="10" r="1.5" fill="#22d3ee" filter="url(#glow)">
              <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="15.5" cy="10" r="1.5" fill="#22d3ee" filter="url(#glow)">
              <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" begin="0.2s"/>
            </circle>
            <!-- Mouth/Chip -->
            <rect x="8" y="13.5" width="8" height="1.5" rx="0.5" fill="url(#iconGradient)" opacity="0.7">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite"/>
            </rect>
            <!-- Ears/Antenna Side -->
            <rect x="2" y="8" width="2" height="3" rx="0.5" stroke="url(#iconGradient)" stroke-width="1" fill="none"/>
            <rect x="20" y="8" width="2" height="3" rx="0.5" stroke="url(#iconGradient)" stroke-width="1" fill="none"/>
          </svg>
        </button>

        <!-- Loading Ring -->
        <div class="chat-launcher-ring"></div>

        <!-- Tooltip -->
        <div class="chat-launcher-tooltip">
          <div class="chat-launcher-tooltip-content">
            <span class="chat-launcher-tooltip-title">AI Assistant</span>
            <span class="chat-launcher-tooltip-desc">Trợ lý thuê máy ảnh</span>
          </div>
        </div>
      `;
    }

    setupDrag() {
      const btn = this.element.querySelector('.chat-launcher-btn');
      if (!btn) return;

      // Mouse drag events
      btn.addEventListener('mousedown', this.onDragStart.bind(this));
      document.addEventListener('mousemove', this.onDragMove.bind(this));
      document.addEventListener('mouseup', this.onDragEnd.bind(this));
    }

    setupTouch() {
      const btn = this.element.querySelector('.chat-launcher-btn');
      if (!btn) return;

      // Touch drag events
      btn.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
      document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
      document.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    setupClick() {
      const btn = this.element.querySelector('.chat-launcher-btn');
      if (!btn) return;

      btn.addEventListener('click', this.onClick.bind(this));
    }

    // ==========================================
    // MOUSE DRAG HANDLERS
    // ==========================================

    onDragStart(e) {
      // Only handle left mouse button
      if (e.button !== 0) return;

      this.isDragging = true;
      this.hasMoved = false;
      this.startX = e.clientX;
      this.startY = e.clientY;

      // Store current position as starting point
      this.element.style.right = 'auto';
      this.element.style.bottom = 'auto';

      // Get current position
      const rect = this.element.getBoundingClientRect();
      this.currentX = rect.left;
      this.currentY = rect.top;

      // Apply position
      this.element.style.left = `${this.currentX}px`;
      this.element.style.top = `${this.currentY}px`;

      // Prevent text selection during drag
      e.preventDefault();
    }

    onDragMove(e) {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.startX;
      const deltaY = e.clientY - this.startY;

      // Check if moved beyond threshold
      if (!this.hasMoved && (Math.abs(deltaX) > CONFIG.dragThreshold || Math.abs(deltaY) > CONFIG.dragThreshold)) {
        this.hasMoved = true;
      }

      // Update position
      this.currentX += deltaX;
      this.currentY += deltaY;

      // Update start point for next move
      this.startX = e.clientX;
      this.startY = e.clientY;

      // Apply position
      this.element.style.left = `${this.currentX}px`;
      this.element.style.top = `${this.currentY}px`;

      e.preventDefault();
    }

    onDragEnd(e) {
      if (!this.isDragging) return;

      this.isDragging = false;

      // Save position only if dragged
      if (this.hasMoved) {
        this.savePosition(this.currentX, this.currentY);
      }

      this.hasMoved = false;
    }

    // ==========================================
    // TOUCH DRAG HANDLERS
    // ==========================================

    onTouchStart(e) {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];

      this.isDragging = true;
      this.hasMoved = false;
      this.startX = touch.clientX;
      this.startY = touch.clientY;

      // Store current position
      this.element.style.right = 'auto';
      this.element.style.bottom = 'auto';

      const rect = this.element.getBoundingClientRect();
      this.currentX = rect.left;
      this.currentY = rect.top;

      this.element.style.left = `${this.currentX}px`;
      this.element.style.top = `${this.currentY}px`;

      e.preventDefault();
    }

    onTouchMove(e) {
      if (!this.isDragging || e.touches.length !== 1) return;

      const touch = e.touches[0];

      const deltaX = touch.clientX - this.startX;
      const deltaY = touch.clientY - this.startY;

      if (!this.hasMoved && (Math.abs(deltaX) > CONFIG.dragThreshold || Math.abs(deltaY) > CONFIG.dragThreshold)) {
        this.hasMoved = true;
      }

      this.currentX += deltaX;
      this.currentY += deltaY;

      this.startX = touch.clientX;
      this.startY = touch.clientY;

      this.element.style.left = `${this.currentX}px`;
      this.element.style.top = `${this.currentY}px`;

      e.preventDefault();
    }

    onTouchEnd(e) {
      if (!this.isDragging) return;

      this.isDragging = false;

      if (this.hasMoved) {
        this.savePosition(this.currentX, this.currentY);
      }

      this.hasMoved = false;
    }

    // ==========================================
    // CLICK HANDLER
    // ==========================================

    onClick(e) {
      // If was dragging, don't trigger click
      if (this.hasMoved || this.isDragging) {
        e.stopPropagation();
        return;
      }

      // Add ripple effect
      const btn = this.element.querySelector('.chat-launcher-btn');
      btn.classList.add('clicked');

      // Add loading state
      this.element.classList.add('loading');

      // Remove classes after animation
      setTimeout(() => {
        btn.classList.remove('clicked');
        this.element.classList.remove('loading');
      }, 600);

      // Dispatch custom event for chat system to listen
      const event = new CustomEvent('chatLauncherClick', {
        bubbles: true,
        detail: { timestamp: Date.now() }
      });
      this.element.dispatchEvent(event);

      // Also dispatch on document for easier listening
      document.dispatchEvent(new CustomEvent('chatLauncherClick'));
    }

    // ==========================================
    // POSITION MANAGEMENT
    // ==========================================

    loadPosition() {
      try {
        const stored = localStorage.getItem(CONFIG.storageKey);
        if (stored) {
          const pos = JSON.parse(stored);
          // Validate position is within viewport
          if (typeof pos.x === 'number' && typeof pos.y === 'number') {
            return pos;
          }
        }
      } catch (e) {
        console.warn('Chat Launcher: Failed to load position', e);
      }

      return { x: CONFIG.defaultX, y: CONFIG.defaultY };
    }

    savePosition(x, y) {
      try {
        // Clamp position to viewport
        const maxX = window.innerWidth - this.element.offsetWidth;
        const maxY = window.innerHeight - this.element.offsetHeight;

        const clampedX = Math.max(0, Math.min(x, maxX));
        const clampedY = Math.max(0, Math.min(y, maxY));

        localStorage.setItem(CONFIG.storageKey, JSON.stringify({
          x: clampedX,
          y: clampedY
        }));

        this.currentX = clampedX;
        this.currentY = clampedY;
      } catch (e) {
        console.warn('Chat Launcher: Failed to save position', e);
      }
    }

    applyPosition() {
      if (this.currentX === undefined) return;

      // Convert from right/bottom to left/top
      const leftPos = this.currentX;
      const topPos = this.currentY;

      // Use right/bottom for default position (from right and bottom edge)
      if (leftPos >= 0 && topPos >= 0) {
        this.element.style.left = `${leftPos}px`;
        this.element.style.top = `${topPos}px`;
        this.element.style.right = 'auto';
        this.element.style.bottom = 'auto';
      } else {
        // Default position: right and bottom
        this.element.style.right = `${Math.abs(leftPos)}px`;
        this.element.style.bottom = `${Math.abs(topPos)}px`;
        this.element.style.left = 'auto';
        this.element.style.top = 'auto';
      }
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    setLoading(loading) {
      if (!this.element) return;

      if (loading) {
        this.element.classList.add('loading');
      } else {
        this.element.classList.remove('loading');
      }
    }

    destroy() {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.isInitialized = false;
    }
  }

  // Initialize and expose to window
  window.ChatLauncher = new ChatLauncher();

})();
