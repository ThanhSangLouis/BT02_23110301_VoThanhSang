import axiosClient from './axiosClient';

export const wishlistAPI = {
  getMyWishlist: () => axiosClient.get('/wishlist'),
  toggleWishlist: (productId) => axiosClient.post(`/wishlist/${productId}`),
  getWishlistStatus: (productId) => axiosClient.get(`/wishlist/${productId}/status`),
};
