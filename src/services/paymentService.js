import api from "./api";

// tạo thanh toán PayOS từ cart
export const createPayOSPaymentFromCart = (orderData) => {
  return api.post("/payos/create-from-cart", orderData);
};

// lấy trạng thái thanh toán PayOS - dùng cho frontend polling
export const getPayOSPaymentStatus = (orderCode) => {
  return api.get(`/payos/status/${orderCode}`);
};

// lấy payment theo order (cũ)
export const getPaymentByOrder = (orderId) => {
  return api.get(`/payments/order/${orderId}`);
};