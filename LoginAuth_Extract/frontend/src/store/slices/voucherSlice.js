import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { voucherAPI } from '../../api/voucher.api';

const initialState = {
  applied: null, // { code, discountAmount, tier }
  loading: false,
  error: null,
};

export const validateVoucher = createAsyncThunk(
  'voucher/validate',
  async ({ code, orderSubtotal }, { rejectWithValue }) => {
    try {
      const data = await voucherAPI.validate({ code, orderSubtotal });
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Voucher không hợp lệ');
    }
  }
);

const voucherSlice = createSlice({
  name: 'voucher',
  initialState,
  reducers: {
    clearVoucher: (state) => {
      state.applied = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.applied = {
          code: action.payload.voucher.code,
          discountAmount: action.payload.discountAmount,
          tier: action.payload.tier,
        };
      })
      .addCase(validateVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearVoucher } = voucherSlice.actions;
export default voucherSlice.reducer;
