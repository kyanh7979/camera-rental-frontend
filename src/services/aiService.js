/**
 * AI Service — goi qua backend Spring Boot
 *
 * Backend endpoint: POST /api/ai/chat
 * API key duoc luu tren server, khong expose ra frontend
 * 
 * Response Format:
 * - SUCCESS: { success: true, data: { reply: "AI response" } }
 * - ERROR: { success: false, message: "Error message" } with HTTP status 429/500/etc
 */

import api from './api.js';

/**
 * Gui message toi AI backend va nhan response
 * @param {string} message - Tin nhan tu nguoi dung
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<{success: boolean, reply?: string, error?: string}|null>} 
 */
export const sendAIMessage = async (message, signal) => {
  console.log('[AI Service] 🔵 Request STARTED:', message);

  try {
    const response = await api.post('/ai/chat', {
      message: message
    }, {
      signal
    });

    console.log('[AI Service] 🟢 Response received:', response?.data);

    // ✅ SUCCESS: Backend tra ve success=true voi reply
    if (response.data?.success && response.data?.data?.reply) {
      const reply = response.data.data.reply;
      console.log('[AI Service] ✅ SUCCESS - reply length:', reply.length);
      return { success: true, reply };
    }

    // ⚠️ UNEXPECTED: success=true nhung khong co reply
    console.warn('[AI Service] ⚠️ Unexpected: success=true but no reply');
    return { success: false, error: 'Invalid response format' };

  } catch (error) {
    // Check if request was aborted
    if (error.name === 'AbortError' || signal?.aborted) {
      console.log('[AI Service] ⛔ Request aborted');
      return null;
    }

    const status = error?.response?.status;
    const responseData = error?.response?.data;

    console.log('[AI Service] 🔴 Error caught - status:', status, 'data:', responseData);

    // ✅ ERROR RESPONSE: Backend tra ve success=false hoac HTTP error
    // Lay error message tu nhieu nguon khac nhau
    let errorMessage = 'Da xay ra loi. Vui long thu lai.';

    if (responseData?.message) {
      errorMessage = responseData.message;
    } else if (responseData?.data?.error) {
      errorMessage = responseData.data.error;
    } else if (responseData?.error) {
      errorMessage = responseData.error;
    }

    // Chi hien rate limit message khi status === 429
    if (status === 429) {
      console.log('[AI Service] ⛔ Rate limit (429):', errorMessage);
      return { success: false, error: 'Ban da gui qua nhieu yeu cau. Vui long cho mot chut roi thu lai.', isRateLimit: true };
    }

    // Xu ly cac status code khac
    if (status === 503 || status === 500) {
      return { success: false, error: 'Dich vu AI dang bao tri. Vui long thu lai sau.' };
    }

    if (status === 401) {
      return { success: false, error: 'Dich vu AI chua duoc cau hinh. Vui long lien he quan tri vien.' };
    }

    if (status === 400) {
      return { success: false, error: 'Yeu cau khong hop le. Vui long thu lai.' };
    }

    console.log('[AI Service] 🔴 Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Kiem tra xem AI service co duoc cau hinh khong
 * @returns {Promise<boolean>}
 */
export const checkAIStatus = async () => {
  try {
    const response = await api.get('/ai/status', { timeout: 5000 });
    console.log('[AI Service] Status check response:', response?.data);
    return response.data?.data?.success === true;
  } catch (error) {
    console.warn('[AI Service] Status check failed:', error?.response?.status || error.message);
    return false;
  }
};
