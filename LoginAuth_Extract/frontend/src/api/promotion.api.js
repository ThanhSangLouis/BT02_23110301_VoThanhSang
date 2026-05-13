import axiosClient from './axiosClient';

export const promotionAPI = {
  getActive: () => axiosClient.get('/promotions'),
  getFeatured: (limit = 5) => axiosClient.get('/promotions/featured', { params: { limit } }),
  getBySlug: (slug) => axiosClient.get(`/promotions/${slug}`),
};
