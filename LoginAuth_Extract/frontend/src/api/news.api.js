import axiosClient from './axiosClient';

export const newsAPI = {
  getNews: (params) => axiosClient.get('/news', { params }),
  getFeatured: (limit = 5) => axiosClient.get('/news/featured', { params: { limit } }),
  getLatest: (limit = 5) => axiosClient.get('/news/latest', { params: { limit } }),
  getBySlug: (slug) => axiosClient.get(`/news/${slug}`),
};
