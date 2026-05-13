import axiosClient from './axiosClient';

export const productAPI = {
  getProducts: (params) => axiosClient.get('/products', { params }),
  getNewProducts: (limit = 8) => axiosClient.get('/products/new', { params: { limit } }),
  getBestsellers: (limit = 8) => axiosClient.get('/products/bestsellers', { params: { limit } }),
  getFeaturedProducts: (limit = 8) => axiosClient.get('/products/featured', { params: { limit } }),
  getProductBySlug: (slug) => axiosClient.get(`/products/${slug}`),
  getRelatedProducts: (id, limit = 6) => axiosClient.get(`/products/related/${id}`, { params: { limit } }),
};
