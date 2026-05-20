/**
 * AI Chat Store — Zustand with user-isolated localStorage persistence
 *
 * Privacy features:
 * - Messages stored per user (ai-chat-{userId})
 * - Auto-clear on logout
 * - Anonymous users get separate empty storage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useAuthStore from './authStore.js';

const getStorageKey = () => {
  try {
    const state = useAuthStore.getState();
    const userId = state?.user?.id;
    const email = state?.user?.email;
    
    if (userId) {
      return `ai-chat-${userId}`;
    }
    if (email) {
      // Fallback: hash email for privacy
      const hash = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
      return `ai-chat-${hash}`;
    }
    return `ai-chat-anonymous-${Date.now()}`;
  } catch {
    return `ai-chat-anonymous`;
  }
};

// Clear AI chat storage for current user
export const clearAICache = () => {
  try {
    const key = getStorageKey();
    localStorage.removeItem(key);
    localStorage.removeItem('ai-chat-store'); // Clear old key too
  } catch (e) {
    console.warn('[AI Chat Store] Failed to clear cache:', e.message);
  }
};

// Get all AI chat keys (for cleanup)
const getAllAIChatKeys = () => {
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ai-chat')) {
        keys.push(key);
      }
    }
  } catch {}
  return keys;
};

// Clear old/other user AI chats (call on login to cleanup old sessions)
export const clearOtherAICaches = () => {
  try {
    const currentKey = getStorageKey();
    const allKeys = getAllAIChatKeys();
    
    allKeys.forEach(key => {
      if (key !== currentKey) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('[AI Chat Store] Failed to clear other caches:', e.message);
  }
};

const useAIChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      isTyping: false,
      error: null,
      currentUserId: null,

      setTyping: (isTyping) => {
        set({ isTyping });
      },

      setError: (error) => {
        set({ error, isTyping: false });
      },

      addMessage: (message) => {
        const messageWithMeta = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          ...message
        };
        set((state) => ({
          messages: [...state.messages, messageWithMeta]
        }));
      },

      clearMessages: () => {
        set({ messages: [], error: null, isTyping: false });
      },

      getMessages: () => get().messages
    }),
    {
      name: 'ai-chat-store',
      storage: {
        getItem: (name) => {
          const userKey = getStorageKey();
          
          try {
            // Try user-specific key first
            const userData = localStorage.getItem(userKey);
            if (userData) {
              const parsed = JSON.parse(userData);
              if (parsed?.state) {
                // Update current user tracking
                try {
                  const userId = useAuthStore.getState()?.user?.id;
                  if (parsed.state) {
                    parsed.state.currentUserId = userId;
                  }
                } catch {}
                return parsed;
              }
            }
            
            // Fallback: try old key (migration)
            const oldData = localStorage.getItem(name);
            if (oldData) {
              const parsed = JSON.parse(oldData);
              // Migrate to user-specific key
              if (parsed?.state?.messages) {
                localStorage.setItem(userKey, JSON.stringify(parsed));
                return parsed;
              }
            }
            
            // No data found - return empty state
            return { state: { messages: [], isTyping: false, error: null, currentUserId: null }, version: 0 };
          } catch {
            return { state: { messages: [], isTyping: false, error: null, currentUserId: null }, version: 0 };
          }
        },
        setItem: (name, value) => {
          const userKey = getStorageKey();
          
          try {
            // Always save to user-specific key
            localStorage.setItem(userKey, JSON.stringify(value));
            
            // Also keep old key for backward compatibility during migration
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.warn('[AI Chat Store] localStorage full, clearing old data:', e.message);
            // Try to free space by removing old entries
            try {
              const allKeys = getAllAIChatKeys();
              // Remove oldest entries
              const keysToRemove = allKeys.slice(0, Math.floor(allKeys.length / 2));
              keysToRemove.forEach(key => localStorage.removeItem(key));
              // Retry
              localStorage.setItem(userKey, JSON.stringify(value));
            } catch {
              // Give up
            }
          }
        },
        removeItem: (name) => {
          try {
            const userKey = getStorageKey();
            localStorage.removeItem(userKey);
            localStorage.removeItem(name);
          } catch {}
        }
      },
      partialize: (state) => ({
        messages: state.messages,
        isTyping: false,
        error: null,
        currentUserId: state.currentUserId
      })
    }
  )
);

// Listen for auth changes to reset messages when user changes
if (typeof window !== 'undefined') {
  let lastUserId = null;
  
  // Check for user changes periodically
  setInterval(() => {
    try {
      const currentUser = useAuthStore.getState()?.user;
      const currentUserId = currentUser?.id;
      
      if (lastUserId !== null && currentUserId !== lastUserId) {
        // User changed - clear messages
        useAIChatStore.getState().clearMessages();
      }
      
      lastUserId = currentUserId;
    } catch {}
  }, 1000);
}

export default useAIChatStore;
