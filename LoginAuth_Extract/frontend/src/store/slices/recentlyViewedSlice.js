import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { recentlyViewedAPI } from '../../api/recentlyViewed.api';

const initialState = {
  products: [],
  loading: false,
  error: null,
};

export const trackRecentlyViewed = createAsyncThunk(
  'recentlyViewed/track',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await recentlyViewedAPI.trackView(productId);
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Không thể ghi nhận đã xem');
    }
  }
);

export const fetchMyRecentlyViewed = createAsyncThunk(
  'recentlyViewed/fetchMy',
  async ({ limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const data = await recentlyViewedAPI.getMyRecentlyViewed({ limit });
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Không thể lấy danh sách đã xem');
    }
  }
);

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    clearRecentlyViewedError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRecentlyViewed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyRecentlyViewed.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
      })
      .addCase(fetchMyRecentlyViewed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRecentlyViewedError } = recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;
