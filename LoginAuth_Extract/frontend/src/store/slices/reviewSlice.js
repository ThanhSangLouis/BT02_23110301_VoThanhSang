import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewAPI } from '../../api/review.api';

const initialState = {
  byProduct: {},
  loading: false,
  error: null,
};

export const fetchReviewsByProduct = createAsyncThunk(
  'reviews/fetchByProduct',
  async ({ productId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const data = await reviewAPI.getReviewsByProduct(productId, { page, limit });
      const payload = data?.data ?? data;
      return { productId, data: payload };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Lỗi khi lấy đánh giá');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/create',
  async ({ productId, orderId, rating, comment }, { rejectWithValue }) => {
    try {
      const data = await reviewAPI.createReview({ productId, orderId, rating, comment });
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Lỗi khi gửi đánh giá');
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.byProduct[action.payload.productId] = action.payload.data;
      })
      .addCase(fetchReviewsByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
