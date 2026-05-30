import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pointsAPI } from '../../api/points.api';

const initialState = {
  pointsBalance: 0,
  ledger: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  loading: false,
  error: null,
};

export const fetchMyPoints = createAsyncThunk(
  'points/fetchMyPoints',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const data = await pointsAPI.getMyPoints({ page, limit });
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Lỗi khi lấy điểm');
    }
  }
);

const pointsSlice = createSlice({
  name: 'points',
  initialState,
  reducers: {
    clearPointsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.pointsBalance = action.payload.pointsBalance || 0;
        state.ledger = action.payload.ledger || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchMyPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPointsError } = pointsSlice.actions;
export default pointsSlice.reducer;
