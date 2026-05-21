import axiosClient from './axiosClient';

export const cartAPI = {
  getCart: () => axiosClient.get('/cart'),
  addToCart: ({ productId, quantity }) => axiosClient.post('/cart/items', { productId, quantity }),
  updateCartItem: (productId, { quantity }) => axiosClient.put(`/cart/items/${productId}`, { quantity }),
  removeFromCart: (productId) => axiosClient.delete(`/cart/items/${productId}`),
  clearCart: () => axiosClient.delete('/cart'),
  toggleSelectItem: (productId, { selected }) => axiosClient.put(`/cart/items/${productId}/select`, { selected }),
  selectAllItems: ({ selected }) => axiosClient.put('/cart/select-all', { selected }),
};
