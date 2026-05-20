/**
 * useAIChat — hook quan ly chat state va goi AI service
 * 
 * Anti-spam features:
 * - pendingRef: lock request during processing
 * - submitGuardRef: prevent double-call in same event loop
 * - cooldownRef: global cooldown between requests
 * - Stale response protection with requestId
 * - AbortController for canceling pending requests
 * 
 * Backend now returns:
 * - SUCCESS: always has reply (real AI or fallback)
 * - ERROR: HTTP status != 200
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import useAIChatStore from '../store/aiChatStore.js';
import { sendAIMessage, checkAIStatus } from '../services/aiService.js';
import { showError, showWarning } from '../components/ui/ToastNotification.jsx';

function useAIChat() {
  const { messages, isTyping, addMessage, setTyping, setError, clearMessages } =
    useAIChatStore();

  const [hasAI, setHasAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  
  // ========== ANTI-SPAM REFS ==========
  const pendingRef = useRef(false);
  const submitGuardRef = useRef(false);
  const statusCheckedRef = useRef(false);
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const cooldownMs = 5000;
  const lastRequestTimeRef = useRef(0);
  const cooldownTimerRef = useRef(null);

  // Check AI status on mount
  useEffect(() => {
    if (statusCheckedRef.current) {
      console.log('[AI Chat] Already checked AI status, skipping');
      return;
    }
    statusCheckedRef.current = true;

    const checkStatus = async () => {
      try {
        const status = await checkAIStatus();
        console.log('[AI Chat] AI status:', status ? 'available' : 'unavailable');
        setHasAI(status);
      } catch (err) {
        console.warn('[AI Chat] Status check error:', err.message);
        setHasAI(false);
      }
    };
    
    checkStatus();

    return () => {
      console.log('[AI Chat] Cleanup - unmount');
      statusCheckedRef.current = false;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
      
      setIsLoading(false);
      setTyping(false);
    };
  }, []);

  const sendMessage = useCallback(async (text) => {
    // ========== GUARD 1: Pending lock ==========
    if (pendingRef.current) {
      console.log('[AI Chat] Blocked: request pending');
      showWarning('Vui long doi request hien tai xu ly xong');
      return;
    }

    // ========== GUARD 2: Submit guard ==========
    if (submitGuardRef.current) {
      console.log('[AI Chat] Blocked: submit guard active');
      return;
    }

    // ========== GUARD 3: Empty message ==========
    const trimmedText = text?.trim();
    if (!trimmedText) {
      console.log('[AI Chat] Blocked: empty message');
      return;
    }

    console.log('[AI Chat] User submitting:', trimmedText);

    // ========== GUARD 4: Loading state ==========
    if (isLoading || isTyping) {
      console.log('[AI Chat] Blocked: request in progress');
      showWarning('Dang xu ly request truoc do...');
      return;
    }

    // ========== GUARD 5: Global cooldown ==========
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    if (timeSinceLastRequest < cooldownMs) {
      const remaining = cooldownMs - timeSinceLastRequest;
      const seconds = Math.ceil(remaining / 1000);
      console.log('[AI Chat] Blocked: cooldown (' + remaining + 'ms remaining)');
      setCooldownRemaining(Math.ceil(remaining / 1000));
      showWarning('Vui long doi ' + seconds + 's truoc khi gui request tiep');
      return;
    }

    // ========== SET LOCKS ==========
    pendingRef.current = true;
    submitGuardRef.current = true;
    
    setIsLoading(true);
    setTyping(true);
    setError(null);

    if (abortControllerRef.current) {
      console.log('[AI Chat] Cancelling previous request');
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const abortController = abortControllerRef.current;

    const currentRequestId = ++requestIdRef.current;
    console.log('[AI Chat] Request ID:', currentRequestId);

    const userMsg = { role: 'user', content: trimmedText, requestId: currentRequestId };
    addMessage(userMsg);

    try {
      lastRequestTimeRef.current = now;
      
      const result = await sendAIMessage(trimmedText, abortController.signal);

      if (abortController.signal.aborted) {
        console.log('[AI Chat] Request aborted');
        return;
      }

      if (currentRequestId !== requestIdRef.current) {
        console.log('[AI Chat] Stale response ignored');
        return;
      }

      console.log('[AI Chat] Result:', result);

      // ========== SUCCESS ==========
      // Backend luon tra ve reply (real AI hoac fallback)
      if (result?.success && result?.reply) {
        console.log('[AI Chat] Adding assistant message');
        addMessage({ role: 'assistant', content: result.reply, requestId: currentRequestId });
        return;
      }

      // ========== ERROR ==========
      // Chi hien toast khi co loi that su
      if (result?.success === false && result?.error) {
        console.log('[AI Chat] Error:', result.error);
        
        if (result.isRateLimit) {
          showWarning(result.error);
        } else {
          showError(result.error);
        }
        return;
      }

      console.log('[AI Chat] Unknown result:', result);
      showError('Da xay ra loi. Vui long thu lai.');

    } catch (err) {
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        console.log('[AI Chat] Aborted');
        return;
      }
      
      if (currentRequestId !== requestIdRef.current) {
        console.log('[AI Chat] Stale error ignored');
        return;
      }
      
      console.error('[AI Chat] Error:', err.message);
      showError('Da xay ra loi ket noi. Vui long thu lai.');
    } finally {
      setIsLoading(false);
      setTyping(false);
      abortControllerRef.current = null;
      pendingRef.current = false;
      submitGuardRef.current = false;
      
      setCooldownRemaining(Math.ceil(cooldownMs / 1000));
      console.log('[AI Chat] Reset complete');
    }
  }, [isLoading, isTyping, addMessage, setTyping, setError]);

  const clearChat = useCallback(() => {
    console.log('[AI Chat] Clear chat');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsLoading(false);
    setTyping(false);
    pendingRef.current = false;
    submitGuardRef.current = false;
    lastRequestTimeRef.current = 0;
    requestIdRef.current = 0;
    setCooldownRemaining(0);
    
    clearMessages();
  }, [clearMessages, setTyping]);

  return {
    messages,
    isTyping,
    isLoading,
    hasAI,
    cooldownRemaining,
    sendMessage,
    clearChat
  };
}

export default useAIChat;
