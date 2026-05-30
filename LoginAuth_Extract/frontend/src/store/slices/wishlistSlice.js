import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistAPI } from '../../api/wishlist.api';

const initialState = {
  products: [],
  statusByProduct: {},
  loading: false,
  error: null,
};

export const fetchMyWishlist = createAsyncThunk(
  'wishlist/fetchMyWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const data = await wishlistAPI.getMyWishlist();
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Lỗi khi lấy wishlist');
    }
  }
);

export const fetchWishlistStatus = createAsyncThunk(
  'wishlist/fetchStatus',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await wishlistAPI.getWishlistStatus(productId);
      const payload = data?.data ?? data;
      return { productId, wished: payload.wished };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Lỗi khi lấy trạng thái wishlist');
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await wishlistAPI.toggleWishlist(productId);
      const payload = data?.data ?? data;
      return { productId, wished: payload.wished };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Lỗi khi cập nhật wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.statusByProduct = (action.payload.products || []).reduce((acc, p) => {
          acc[p._id] = true;
          return acc;
        }, {});
      })
      .addCase(fetchMyWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWishlistStatus.fulfilled, (state, action) => {
        state.statusByProduct[action.payload.productId] = action.payload.wished;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.statusByProduct[action.payload.productId] = action.payload.wished;
        if (!action.payload.wished) {
          state.products = state.products.filter((p) => p._id !== action.payload.productId);
        }
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
