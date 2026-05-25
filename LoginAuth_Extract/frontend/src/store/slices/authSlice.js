import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/auth.api';
import { persistUser, clearPersistedUser } from '../../api/axiosClient';

// ── Async Thunks ──────────────────────────────────────────────────────────────

/** Load current authenticated user from cookie session */
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAPI.getMe();
      // axios unwraps response.data → res = { success, data: user }
      // So res.data IS the user object
      return res?.data ?? res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to load user');
    }
  }
);

/** Login with email + password */
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await authAPI.login({ email, password });
      // axiosClient unwraps .data → response is already { success, data: { user } }
      const payload = res?.data ?? res;
      return payload?.user ?? payload;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error?.message || 'Đăng nhập thất bại'
      );
    }
  }
);

/** Register new account */
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, username, password }, { rejectWithValue }) => {
    try {
      const res = await authAPI.register({ email, username, password });
      return res?.data ?? res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error?.message || 'Đăng ký thất bại'
      );
    }
  }
);

/** Verify email with OTP after registration */
export const verifyEmailOtp = createAsyncThunk(
  'auth/verifyEmailOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await authAPI.verifyEmailOtp({ email, otp });
      const payload = res?.data ?? res;
      return payload?.user ?? payload;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error?.message || 'Xác minh OTP thất bại'
      );
    }
  }
);

/** Logout user */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
  }
);

/** Send forgot-password OTP email */
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      await authAPI.forgotPassword({ email });
      return true;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error?.message || 'Không thể gửi OTP đặt lại mật khẩu'
      );
    }
  }
);

/** Reset password with OTP */
export const resetPasswordOtp = createAsyncThunk(
  'auth/resetPasswordOtp',
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      await authAPI.resetPasswordOtp({ email, otp, newPassword });
      return true;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error?.message || 'Đặt lại mật khẩu thất bại'
      );
    }
  }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  user:                     null,
  isAuthenticated:          false,
  loading:                  false,
  error:                    null,
  requiresEmailVerification: false,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState, // 1. Dữ liệu ban đầu trong két
  reducers: { // 2. Các ông thủ quỹ xử lý đơn
    clearError:  (state)         => { state.error = null; },
    resetAuth:   ()              => initialState,
    setUser:     (state, action) => { // Khi nhận đơn (action), thủ quỹ mới cập nhật két (state)
      state.user            = action.payload;
      state.isAuthenticated = true;
      state.loading         = false;
      state.error           = null; 
    },
  },
  extraReducers: (builder) => {
    // ── loadUser ─────────────────────────────────────────────
    builder
      .addCase(loadUser.pending,   (state)          => { state.loading = true; state.error = null; })
      .addCase(loadUser.fulfilled, (state, action)  => {
        state.user = action.payload; state.isAuthenticated = true; state.loading = false;
        persistUser(action.payload);
      })
      .addCase(loadUser.rejected,  (state)          => {
        state.user = null; state.isAuthenticated = false; state.loading = false;
      });

    // ── loginUser ─────────────────────────────────────────────
    builder
      .addCase(loginUser.pending,   (state)         => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload; state.isAuthenticated = true;
        state.loading = false; state.error = null;
        persistUser(action.payload);
      })
      .addCase(loginUser.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── registerUser ──────────────────────────────────────────
    builder
      .addCase(registerUser.pending,   (state)         => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state)         => {
        state.loading = false; state.requiresEmailVerification = true;
      })
      .addCase(registerUser.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── verifyEmailOtp ────────────────────────────────────────
    builder
      .addCase(verifyEmailOtp.pending,   (state)         => { state.loading = true; state.error = null; })
      .addCase(verifyEmailOtp.fulfilled, (state, action) => {
        state.user = action.payload; state.isAuthenticated = true;
        state.loading = false; state.error = null; state.requiresEmailVerification = false;
        persistUser(action.payload);
      })
      .addCase(verifyEmailOtp.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── logoutUser ────────────────────────────────────────────
    builder
      .addCase(logoutUser.pending,   (state) => { state.loading = true; })
      .addCase(logoutUser.fulfilled, (state) => {
        clearPersistedUser();
        state.user = null; state.isAuthenticated = false;
        state.loading = false; state.error = null; state.requiresEmailVerification = false;
      })
      .addCase(logoutUser.rejected,  (state) => {
        state.user = null; state.isAuthenticated = false; state.loading = false; state.error = null;
      });

    // ── forgotPassword ────────────────────────────────────────
    builder
      .addCase(forgotPassword.pending,   (state)         => { state.loading = true; state.error = null; })
      .addCase(forgotPassword.fulfilled, (state)         => { state.loading = false; })
      .addCase(forgotPassword.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── resetPasswordOtp ──────────────────────────────────────
    builder
      .addCase(resetPasswordOtp.pending,   (state)         => { state.loading = true; state.error = null; })
      .addCase(resetPasswordOtp.fulfilled, (state)         => { state.loading = false; })
      .addCase(resetPasswordOtp.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload;
      });
  },
});

export const { clearError, resetAuth, setUser } = authSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAuth                       = (state) => state.auth;
export const selectUser                       = (state) => state.auth.user;
export const selectIsAuthenticated            = (state) => state.auth.isAuthenticated;
export const selectAuthLoading                = (state) => state.auth.loading;
export const selectAuthError                  = (state) => state.auth.error;
export const selectRequiresEmailVerification  = (state) => state.auth.requiresEmailVerification;

export default authSlice.reducer;
