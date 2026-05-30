import axiosClient from './axiosClient';

export const voucherAPI = {
  validate: ({ code, orderSubtotal }) => axiosClient.post('/vouchers/validate', { code, orderSubtotal }),

  // admin
  adminList: (params) => axiosClient.get('/vouchers/admin', { params }),
  adminCreate: (payload) => axiosClient.post('/vouchers/admin', payload),
  adminUpdate: (id, payload) => axiosClient.put(`/vouchers/admin/${id}`, payload),
  adminDelete: (id) => axiosClient.delete(`/vouchers/admin/${id}`),
};
