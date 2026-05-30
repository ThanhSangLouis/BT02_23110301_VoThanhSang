import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import reviewReducer from './slices/reviewSlice';
import pointsReducer from './slices/pointsSlice';
import wishlistReducer from './slices/wishlistSlice';
import recentlyViewedReducer from './slices/recentlyViewedSlice';
import voucherReducer from './slices/voucherSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer, // Ngăn kéo chứa thông tin Đăng nhập
    cart: cartReducer, // Ngăn kéo chứa Giỏ hàng
    order: orderReducer, // Ngăn kéo chứa Đơn hàng
    reviews: reviewReducer,
    points: pointsReducer,
    wishlist: wishlistReducer,
    recentlyViewed: recentlyViewedReducer,
    voucher: voucherReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
