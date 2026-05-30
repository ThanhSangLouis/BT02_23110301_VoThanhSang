import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderAPI } from '../../api/order.api';

const initialState = {
  orders: [],
  currentOrder: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async ({ shippingInfo, paymentMethod = 'COD', voucherCode = null, pointsToUse = 0 }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.createOrder({ shippingInfo, paymentMethod, voucherCode, pointsToUse });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Lỗi khi tạo đơn hàng');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async ({ page = 1, limit = 10, status } = {}, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrders({ page, limit, status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Lỗi khi lấy danh sách đơn hàng');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrderById(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Lỗi khi lấy chi tiết đơn hàng');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.cancelOrder(orderId, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Lỗi khi hủy đơn hàng');
    }
  }
);

export const requestOrderCancellation = createAsyncThunk(
  'order/requestCancellation',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.requestCancellation(orderId, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Lỗi khi gửi yêu cầu hủy đơn');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        const index = state.orders.findIndex(o => o._id === action.payload.order._id);
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(requestOrderCancellation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestOrderCancellation.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(requestOrderCancellation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
