/**
 * Telegram Notification Service — fail-safe layer
 *
 * Nguyên tắc:
 * - KHÔNG bao giờ throw lỗi ra ngoài
 * - API chính luôn chạy bình thường dù Telegram có lỗi
 * - Rate-limit + duplicate protection
 * - Chỉ dùng import.meta.env (Vite)
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org';

// ─── Config — đọc trực tiếp từ import.meta.env ───────────────────────────────
const TELEGRAM_ENABLED = import.meta.env.VITE_TELEGRAM_ENABLED === 'true';
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

// Debug log khi service được import
console.log('[Telegram] Config loaded — ENABLED:', TELEGRAM_ENABLED);
console.log('[Telegram] Config loaded — BOT_TOKEN:', BOT_TOKEN ? '***' + BOT_TOKEN.slice(-6) : 'MISSING');
console.log('[Telegram] Config loaded — CHAT_ID:', CHAT_ID || 'MISSING');

// ─── Validate config ───────────────────────────────────────────────────────────
const hasConfig = () => {
  if (!TELEGRAM_ENABLED) {
    console.warn('[Telegram] Not enabled (VITE_TELEGRAM_ENABLED != true)');
    return false;
  }
  if (!BOT_TOKEN) {
    console.warn('[Telegram] Missing VITE_TELEGRAM_BOT_TOKEN');
    return false;
  }
  if (!CHAT_ID) {
    console.warn('[Telegram] Missing VITE_TELEGRAM_CHAT_ID');
    return false;
  }
  return true;
};

// ─── Rate-limit cache ─────────────────────────────────────────────────────────
const _cache = new Map();

const _markSent = (key) => _cache.set(key, Date.now());
const _isSent = (key) => _cache.has(key);

// ─── Core gửi Telegram ────────────────────────────────────────────────────────
const _sendTelegram = async (text) => {
  if (!hasConfig()) return false;

  const url = `${TELEGRAM_API_BASE}/bot${BOT_TOKEN}/sendMessage`;

  console.info('[Telegram] Sending notification...');
  console.info('[Telegram] Endpoint:', url);
  console.info('[Telegram] Payload:', JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    console.info('[Telegram] Response status:', res.status, data);

    if (!res.ok || !data.ok) {
      console.error(`[Telegram] API error — status: ${res.status}, response:`, data);
      return false;
    }

    console.info('[Telegram] ✅ Success:', data.result?.message_id || 'OK');
    return true;
  } catch (err) {
    console.error('[Telegram] ❌ Network error:', err.message);
    return false;
  }
};

// ─── Message builders ─────────────────────────────────────────────────────────
const buildNewUserMessage = ({ fullname, email, phone, createdAt }) => {
  const time = createdAt
    ? new Date(createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  return `🎉 <b>Người dùng mới đăng ký</b>

👤 <b>Họ tên:</b> ${fullname || 'Không có'}
📧 <b>Email:</b> ${email || 'Không có'}
📱 <b>SĐT:</b> ${phone || 'Không có'}
🕒 <b>Thời gian:</b> ${time}

🚀 Có người dùng mới trên hệ thống.`;
};

const buildPaymentMessage = ({ customerName, orderCode, totalAmount, paidAt }) => {
  const time = paidAt
    ? new Date(paidAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const formatted = totalAmount
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)
    : 'Không rõ';

  return `✅ <b>Thanh toán thành công</b>

👤 <b>Khách hàng:</b> ${customerName || 'Không rõ'}
📦 <b>Đơn hàng:</b> #${orderCode || 'Không rõ'}
💰 <b>Tổng tiền:</b> ${formatted}
🕒 <b>Thời gian:</b> ${time}

🎉 Cảm ơn quý khách đã sử dụng dịch vụ!`;
};

const buildOrderMessage = ({ customerName, productName, totalAmount, orderDate }) => {
  const time = orderDate
    ? new Date(orderDate).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const formatted = totalAmount
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)
    : 'Không rõ';

  return `📦 <b>Đơn hàng mới</b>

👤 <b>Khách hàng:</b> ${customerName || 'Không rõ'}
📷 <b>Sản phẩm:</b> ${productName || 'Không rõ'}
💰 <b>Tổng tiền:</b> ${formatted}
🕒 <b>Thời gian:</b> ${time}

📋 Có đơn hàng mới cần xử lý!`;
};

const buildTestMessage = () => {
  const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  return `✅ <b>Telegram bot hoạt động</b>

🕒 Thời gian: ${time}
🤖 Hệ thống LensRent kết nối thành công!`;
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Thông báo người dùng mới đăng ký
 * Chỉ gửi sau khi register thành công thật sự
 */
export const notifyNewUser = async (userData) => {
  if (!hasConfig()) return;

  const key = `user:${userData.email}`;
  if (_isSent(key)) {
    console.info('[Telegram] notifyNewUser: duplicate, skipped');
    return;
  }

  try {
    const message = buildNewUserMessage(userData);
    const ok = await _sendTelegram(message);
    if (ok) _markSent(key);
  } catch (err) {
    console.error('[Telegram] notifyNewUser error:', err.message);
    // KHÔNG throw
  }
};

/**
 * Thông báo thanh toán PayOS thành công
 */
export const notifyPaymentSuccess = async (paymentData) => {
  if (!hasConfig()) return;

  const key = `payment:${paymentData.orderCode}`;
  if (_isSent(key)) {
    console.info('[Telegram] notifyPaymentSuccess: duplicate, skipped');
    return;
  }

  try {
    const message = buildPaymentMessage(paymentData);
    const ok = await _sendTelegram(message);
    if (ok) _markSent(key);
  } catch (err) {
    console.error('[Telegram] notifyPaymentSuccess error:', err.message);
    // KHÔNG throw
  }
};

/**
 * Thông báo đơn hàng mới
 */
export const notifyNewOrder = async (orderData) => {
  if (!hasConfig()) return;

  const key = `order:${orderData.orderCode || orderData.id}`;
  if (_isSent(key)) {
    console.info('[Telegram] notifyNewOrder: duplicate, skipped');
    return;
  }

  try {
    const message = buildOrderMessage(orderData);
    const ok = await _sendTelegram(message);
    if (ok) _markSent(key);
  } catch (err) {
    console.error('[Telegram] notifyNewOrder error:', err.message);
    // KHÔNG throw
  }
};

/**
 * Gửi test notification
 */
export const sendTestNotification = async () => {
  if (!hasConfig()) {
    return { success: false, error: 'Telegram not configured' };
  }

  try {
    const message = buildTestMessage();
    const ok = await _sendTelegram(message);
    return ok
      ? { success: true, telegram: 'sent' }
      : { success: false, error: 'Telegram API returned error' };
  } catch (err) {
    console.error('[Telegram] sendTestNotification error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Xóa rate-limit cache (dùng khi test)
 */
export const clearTelegramCache = () => {
  _cache.clear();
  console.info('[Telegram] Cache cleared');
};
