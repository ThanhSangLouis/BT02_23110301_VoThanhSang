import axiosClient from './axiosClient';

const adminAPI = {
  // Orders
  getOrders: async (params = {}) => {
    return axiosClient.get('/admin/orders', { params });
  },
  getOrderById: async (id) => {
    return axiosClient.get(`/admin/orders/${id}`);
  },
  updateOrderStatus: async (id, data) => {
    return axiosClient.patch(`/admin/orders/${id}/status`, data);
  },

  // Cancellation requests (handled by /orders routes, but admin can access)
  getCancellationRequests: async (params = {}) => {
    return axiosClient.get('/orders/cancellation-requests', { params });
  },
  processCancellationRequest: async (requestId, data) => {
    return axiosClient.post(`/orders/cancellation-requests/${requestId}/process`, data);
  },

  // Products
  getProducts: async (params = {}) => {
    return axiosClient.get('/admin/products', { params });
  },
  getProductById: async (id) => {
    return axiosClient.get(`/admin/products/${id}`);
  },
  createProduct: async (data) => {
    return axiosClient.post('/admin/products', data);
  },
  updateProduct: async (id, data) => {
    return axiosClient.put(`/admin/products/${id}`, data);
  },
  deleteProduct: async (id) => {
    return axiosClient.delete(`/admin/products/${id}`);
  },

  // Users
  getUsers: async (params = {}) => {
    return axiosClient.get('/admin/users', { params });
  },
  getUserById: async (id) => {
    return axiosClient.get(`/admin/users/${id}`);
  },
  updateUser: async (id, data) => {
    return axiosClient.put(`/admin/users/${id}`, data);
  },
  deleteUser: async (id) => {
    return axiosClient.delete(`/admin/users/${id}`);
  },
  createUser: async (data) => {
    return axiosClient.post('/admin/users', data);
  },
};

export default adminAPI;
