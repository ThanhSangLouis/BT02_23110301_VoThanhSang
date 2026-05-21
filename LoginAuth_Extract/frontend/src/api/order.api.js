import axiosClient from './axiosClient';

export const orderAPI = {
  createOrder: ({ shippingInfo, paymentMethod }) =>
    axiosClient.post('/orders', { shippingInfo, paymentMethod }),
  getOrders: ({ page = 1, limit = 10, status } = {}) =>
    axiosClient.get('/orders', { params: { page, limit, status } }),
  getOrderById: (orderId) => axiosClient.get(`/orders/${orderId}`),
  cancelOrder: (orderId, { reason }) =>
    axiosClient.post(`/orders/${orderId}/cancel`, { reason }),
  requestCancellation: (orderId, { reason }) =>
    axiosClient.post(`/orders/${orderId}/request-cancel`, { reason }),
};
