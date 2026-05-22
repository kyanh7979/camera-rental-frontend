/**
 * Centralized Order Status configuration for the frontend.
 * All status-related constants, labels, colors, and flow definitions live here.
 * Reuse these across Admin/Orders, Profile, Dashboard, and any other component.
 */

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PAID: 'PAID',
  RENTING: 'RENTING',
  RETURNED: 'RETURNED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

/**
 * All status values that count as "paid" for revenue / reporting purposes.
 * Note: CONFIRMED is NOT included — confirmed means "admin approved but payment not yet received".
 */
export const PAID_STATUSES = ['PAID', 'RENTING', 'RETURNED', 'COMPLETED'];

/**
 * All status values that count as "active" for rental tracking purposes.
 * Note: PAID is included because payment received means the rental agreement is active.
 */
export const ACTIVE_STATUSES = ['CONFIRMED', 'PAID', 'RENTING'];

/**
 * Status labels for filter dropdowns.
 * Key = filter key (uppercase).
 * Label = user-facing Vietnamese text.
 *
 * Special multi-status filters:
 * - RETURNED_AND_COMPLETED: shows both RETURNED + COMPLETED orders
 *   (business: "returned" = "equipment has been returned", which includes completed orders)
 */
export const STATUS_LABELS = {
  ALL: 'Tất cả',
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PAID: 'Đã thanh toán',
  RENTING: 'Đang thuê',
  RETURNED_AND_COMPLETED: 'Đã trả',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn thành',
};

/**
 * Tooltip/description for filter options that need clarification.
 */
export const STATUS_FILTER_NOTES = {
  RETURNED_AND_COMPLETED: 'Bao gồm đơn đã trả thiết bị (RETURNED) và đơn đã hoàn thành (COMPLETED)',
};

/**
 * Status display configuration for badge rendering.
 * Used by Admin/Orders, Dashboard, and Profile pages.
 */
export const STATUS_DISPLAY = {
  PENDING: {
    label: 'Chờ xác nhận',
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    description: 'Đơn đang chờ admin xác nhận',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    description: 'Đơn đã được duyệt, đang chờ thanh toán',
  },
  PAID: {
    label: 'Đã thanh toán',
    bg: 'bg-indigo-500/20',
    text: 'text-indigo-400',
    description: 'Khách đã thanh toán thành công',
  },
  RENTING: {
    label: 'Đang thuê',
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    description: 'Thiết bị đang được thuê',
  },
  RETURNED: {
    label: 'Đã trả thiết bị',
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    description: 'Khách đã trả thiết bị',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    description: 'Đơn thuê đã hoàn tất',
  },
  CANCELLED: {
    label: 'Đã hủy',
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    description: 'Đơn đã bị hủy',
  },
};

/**
 * Profile-specific (light theme) status display config.
 */
export const STATUS_DISPLAY_PROFILE = {
  PENDING: { label: 'Chờ xác nhận', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  CONFIRMED: { label: 'Đã xác nhận', bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  PAID: { label: 'Đã thanh toán', bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' },
  RENTING: { label: 'Đang thuê', bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' },
  RETURNED: { label: 'Đã trả thiết bị', bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' },
  COMPLETED: { label: 'Hoàn thành', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  CANCELLED: { label: 'Đã hủy', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
};

/**
 * Payment status labels for user-facing display.
 * Used in Profile order cards and order detail modals.
 */
export const PAYMENT_STATUS_LABELS = {
  PENDING: { label: 'Chưa thanh toán', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  PROCESSING: { label: 'Đang xử lý', bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  COMPLETED: { label: 'Đã thanh toán', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  FAILED: { label: 'Thanh toán lỗi', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  REFUNDED: { label: 'Đã hoàn tiền', bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' },
};

/**
 * Valid status transitions for admin order management.
 * Each key is the current status; values are allowed next statuses.
 *
 * Flow: PENDING → CONFIRMED → PAID → RENTING → RETURNED → COMPLETED
 * Any non-terminal status can be CANCELLED.
 */
export const STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PAID', 'CANCELLED'],
  PAID: ['RENTING', 'CANCELLED'],
  RENTING: ['RETURNED', 'CANCELLED'],
  RETURNED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Order lifecycle for progress/timeline display.
 * Each entry: [status, label, description].
 */
export const ORDER_LIFECYCLE = [
  { status: 'PENDING', label: 'Chờ xác nhận', description: 'Đơn đang chờ admin xác nhận' },
  { status: 'CONFIRMED', label: 'Đã xác nhận', description: 'Đơn đã được duyệt, đang chờ thanh toán' },
  { status: 'PAID', label: 'Đã thanh toán', description: 'Khách đã thanh toán thành công' },
  { status: 'RENTING', label: 'Đang thuê', description: 'Thiết bị đang được thuê' },
  { status: 'RETURNED', label: 'Đã trả thiết bị', description: 'Khách đã trả thiết bị' },
  { status: 'COMPLETED', label: 'Hoàn thành', description: 'Đơn thuê đã hoàn tất' },
];

/**
 * Map frontend status aliases to backend enum values.
 * Used when frontend sends status values that don't exactly match backend enum.
 */
export const FRONTEND_TO_BACKEND_STATUS_MAP = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PAID: 'PAID',
  PICKED_UP: 'RENTING',
  RENTING: 'RENTING',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

/**
 * Get display info for a given backend status value.
 * Falls back to "Không rõ" for unknown statuses.
 */
export const getStatusDisplay = (status) => {
  const upper = status?.toUpperCase();
  return STATUS_DISPLAY[upper] || {
    label: status || 'Không rõ',
    bg: 'bg-slate-500/20',
    text: 'text-slate-400',
    description: 'Trạng thái không xác định',
  };
};

/**
 * Get profile-style display info for a given backend status value.
 */
export const getStatusDisplayProfile = (status) => {
  const upper = status?.toUpperCase();
  return STATUS_DISPLAY_PROFILE[upper] || {
    label: status || 'Không rõ',
    bg: 'rgba(100, 116, 139, 0.15)',
    color: '#64748b',
  };
};

/**
 * Map a frontend status string to its backend equivalent.
 */
export const mapFrontendToBackendStatus = (status) => {
  const upper = status?.toUpperCase();
  return FRONTEND_TO_BACKEND_STATUS_MAP[upper] || status;
};

/**
 * Get allowed next statuses for a given current status.
 */
export const getNextStatuses = (currentStatus) => {
  const backendStatus = mapFrontendToBackendStatus(currentStatus);
  return STATUS_TRANSITIONS[backendStatus] || [];
};

/**
 * Check if a status value counts as "paid" (for revenue/reporting).
 */
export const isPaidStatus = (status) => {
  return PAID_STATUSES.includes(status?.toUpperCase());
};

/**
 * Check if a status value counts as "active" (for rental tracking).
 */
export const isActiveStatus = (status) => {
  return ACTIVE_STATUSES.includes(status?.toUpperCase());
};

/**
 * All statuses that count as "returned" in the business sense.
 * Includes both RETURNED (equipment returned, pending completion) and COMPLETED (fully finished).
 * Used by the "Đã trả" (Returned) filter.
 */
export const RETURNED_STATUSES = ['RETURNED', 'COMPLETED'];

/**
 * Check if a status is "returned" in the business sense.
 * "Đã trả" = equipment has been returned = RETURNED OR COMPLETED.
 */
export const isReturnedStatus = (status) => {
  return RETURNED_STATUSES.includes(status?.toUpperCase());
};

/**
 * Map filter key to the backend status value(s) it represents.
 *
 * Single-status filters: returns single string
 * Multi-status filters (RETURNED_AND_COMPLETED): returns array of strings
 *
 * @param {string} filterKey - The filter key from dropdown (e.g., "RETURNED_AND_COMPLETED", "PENDING")
 * @returns {string | string[]} - Backend status value(s)
 */
export const getFilterStatuses = (filterKey) => {
  const key = filterKey?.toUpperCase();

  switch (key) {
    case 'ALL':
      return null; // null means no filter
    case 'RETURNED_AND_COMPLETED':
      return ['RETURNED', 'COMPLETED'];
    default:
      // Single status filter — map to backend enum
      return mapFrontendToBackendStatus(filterKey);
  }
};

/**
 * Check if an order's status matches a given filter value.
 * Handles both single-status and multi-status filters.
 *
 * @param {string} orderStatus - The order's current status (from backend)
 * @param {string} filterKey - The selected filter key
 * @returns {boolean}
 */
export const matchesFilter = (orderStatus, filterKey) => {
  const key = filterKey?.toUpperCase();

  if (key === 'ALL') {
    return true;
  }

  const filterStatuses = getFilterStatuses(filterKey);

  // Multi-status filter (array)
  if (Array.isArray(filterStatuses)) {
    return filterStatuses.includes(orderStatus?.toUpperCase());
  }

  // Single-status filter
  return orderStatus?.toUpperCase() === filterStatuses;
};
