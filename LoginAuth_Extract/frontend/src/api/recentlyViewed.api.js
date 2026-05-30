import axiosClient from './axiosClient';

export const recentlyViewedAPI = {
  trackView: (productId) => axiosClient.post(`/recently-viewed/${productId}`),
  getMyRecentlyViewed: (params) => axiosClient.get('/recently-viewed', { params }),
};
