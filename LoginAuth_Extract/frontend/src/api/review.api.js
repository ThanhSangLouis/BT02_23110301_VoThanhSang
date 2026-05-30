import axiosClient from './axiosClient';

export const reviewAPI = {
  createReview: (data) => axiosClient.post('/reviews', data),
  getReviewsByProduct: (productId, params) =>
    axiosClient.get(`/reviews/product/${productId}`, { params }),
};
