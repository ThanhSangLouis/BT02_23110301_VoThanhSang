import axiosClient from './axiosClient';

export const pointsAPI = {
  getMyPoints: (params) => axiosClient.get('/points/me', { params }),
};
