# BT02 – Login Auth

> **Bài tập tuần 02** – Đăng nhập với React.js, TailwindCSS, Axios, Redux Toolkit

---

## Cấu trúc dự án

```
LoginAuth_Extract/
├── frontend/          # React + Vite + TailwindCSS
│   └── src/
│       ├── api/           # Axios client + auth API service
│       ├── components/    # AuthInput, AuthButton, AuthCard, PasswordStrength
│       ├── hooks/         # useAuth (Redux Hook)
│       ├── pages/         # LoginPage, RegisterPage, ForgotPasswordPage, DashboardPage
│       └── store/         # Redux store + authSlice (createAsyncThunk)
└── server/            # Node.js + Express API
    └── src/
        └── modules/
            ├── auth/  # Login, Register, Logout, Forgot/Reset Password, OTP
            └── user/  # GET /users/me
```

---

## Công nghệ

| Layer     | Stack                                               |
|-----------|-----------------------------------------------------|
| Frontend  | React 18, Vite 5, **TailwindCSS 3**, **Axios**, **Redux Toolkit**, react-router-dom v6 |
| Backend   | Node.js, Express 5, JWT, MongoDB, cookie-session    |

---

## Khởi động

### 1. Backend (server)

```bash
cd server
npm install
# Tạo file .env (copy từ .env.example hoặc điền thông tin MongoDB)
npm run dev
# → http://localhost:5000
```

### 2. Frontend (React)

```bash
cd frontend
npm install   # (đã cài nếu chạy lần đầu)
npm run dev
# → http://localhost:5173
```

---

## Các tính năng

| Tính năng             | Đường dẫn            |
|-----------------------|----------------------|
| Đăng nhập             | `/login`             |
| Đăng ký + xác minh OTP | `/register`         |
| Quên mật khẩu         | `/forgot-password`   |
| Dashboard (sau đăng nhập) | `/dashboard`     |

---

## Kiến trúc Frontend

### Components tái sử dụng

| Component           | Mô tả                                          |
|---------------------|------------------------------------------------|
| `AuthInput`         | Input có icon, right-element và error state    |
| `AuthButton`        | Button có loading spinner, primary/secondary   |
| `AuthCard`          | Wrapper card với dark theme + slide-up animation |
| `PasswordStrength`  | Thanh đo độ mạnh mật khẩu 5 cấp độ             |

### State Management (Redux)

```
store/
├── store.js           # configureStore
└── slices/
    └── authSlice.js   # createAsyncThunk: login, register, verify, logout,
                       #                   forgotPassword, resetPasswordOtp
```

### API Layer (Axios)

```
api/
├── axiosClient.js     # Axios instance + interceptor auto-refresh 401
└── auth.api.js        # POST /auth/login, /auth/register, /auth/verify-email-otp, ...
```
