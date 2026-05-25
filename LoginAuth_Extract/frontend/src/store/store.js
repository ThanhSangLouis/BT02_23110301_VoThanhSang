import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer, // Ngăn kéo chứa thông tin Đăng nhập
    cart: cartReducer, // Ngăn kéo chứa Giỏ hàng
    order: orderReducer, // Ngăn kéo chứa Đơn hàng
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
