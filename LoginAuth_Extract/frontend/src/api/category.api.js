import axiosClient from './axiosClient';

export const categoryAPI = {
  getAll: () => axiosClient.get('/categories'),
  getFeatured: () => axiosClient.get('/categories/featured'),
  getBySlug: (slug) => axiosClient.get(`/categories/${slug}`),
};
