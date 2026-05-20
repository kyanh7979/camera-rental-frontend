import api from './api.js';

const orderService = {
  getMyOrders: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/orders/my-orders?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my orders:', error);
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  getOrderByCode: async (orderCode) => {
    try {
      const response = await api.get(`/orders/code/${orderCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order by code:', error);
      throw error;
    }
  },

  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  getPaymentStatus: async (orderCode) => {
    try {
      // orderCode from PayOS is numeric (timestamp)
      // Backend stores as "ORD-{timestamp}" but status endpoint handles this
      const response = await api.get(`/payment/payos/status/${orderCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }
};

export default orderService;
