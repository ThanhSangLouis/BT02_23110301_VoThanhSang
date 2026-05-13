# BookStore - Trang Web Bán Sách

Dự án xây dựng trang web bán sách với React + Node.js + MongoDB + Tailwind CSS.

## Tính năng

### Authentication (Đã có từ bài trước)
- Đăng ký với xác minh email OTP
- Đăng nhập/Đăng xuất
- Quên mật khẩu với OTP
- JWT Authentication với refresh token

### Trang chủ (Home Page)
- Banner khuyến mãi với Swiper carousel
- Sách mới nhất
- Sách bán chạy
- Danh mục nổi bật
- Thông tin người dùng đã đăng nhập

### Chi tiết sản phẩm
- Swiper gallery cho nhiều hình ảnh
- Thông tin sản phẩm đầy đủ (tên, tác giả, NXB, giá, tồn kho, đã bán)
- Tăng/giảm số lượng
- Sản phẩm tương tự
- Danh mục tương ứng

### Tìm kiếm & Lọc
- Tìm kiếm theo tên sách, tác giả
- Lọc theo danh mục
- Lọc theo khoảng giá
- Sắp xếp (mới nhất, bán chạy, giá)
- Phân trang

### Tin tức
- Danh sách tin tức
- Chi tiết bài viết

## Cấu trúc Project

```
LoginAuth_Extract/
├── server/                    # Backend (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # Authentication
│   │   │   ├── category/     # Danh mục
│   │   │   ├── product/      # Sản phẩm
│   │   │   ├── promotion/    # Khuyến mãi
│   │   │   └── news/         # Tin tức
│   │   ├── scripts/
│   │   │   └── seed.js       # Script tạo dữ liệu mẫu
│   │   └── ...
│   └── package.json
│
└── frontend/                  # Frontend (React + Vite + Tailwind)
    ├── src/
    │   ├── api/              # API clients
    │   ├── components/       # Reusable components
    │   ├── pages/            # Page components
    │   ├── store/           # Redux store
    │   └── ...
    └── package.json
```

## Hướng dẫn cài đặt

### 1. Cài đặt Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd frontend
npm install
npm install swiper
```

### 2. Cấu hình MongoDB

Chỉnh sửa file `server/.env.development`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.cwgvd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 3. Chạy Seed Data

```bash
cd server
npm run seed
```

Script sẽ tạo:
- 5 danh mục (Văn học, Kinh tế, Thiếu nhi, CNTT, Ngoại ngữ)
- 20 sách mẫu
- 3 khuyến mãi
- 5 tin tức

### 4. Chạy ứng dụng

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Truy cập

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/verify-email-otp` - Xác minh OTP
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password-otp` - Reset mật khẩu

### Products
- `GET /api/products` - Danh sách sản phẩm (filter, sort, pagination)
- `GET /api/products/new` - Sách mới
- `GET /api/products/bestsellers` - Sách bán chạy
- `GET /api/products/featured` - Sách nổi bật
- `GET /api/products/:slug` - Chi tiết sản phẩm
- `GET /api/products/related/:id` - Sản phẩm tương tự

### Categories
- `GET /api/categories` - Danh sách danh mục
- `GET /api/categories/featured` - Danh mục nổi bật
- `GET /api/categories/:slug` - Chi tiết danh mục

### Promotions
- `GET /api/promotions` - Danh sách khuyến mãi
- `GET /api/promotions/featured` - Khuyến mãi nổi bật
- `GET /api/promotions/:slug` - Chi tiết khuyến mãi

### News
- `GET /api/news` - Danh sách tin tức
- `GET /api/news/featured` - Tin tức nổi bật
- `GET /api/news/latest` - Tin tức mới nhất
- `GET /api/news/:slug` - Chi tiết tin tức

## Thư viện sử dụng

### Backend
- Express.js
- Mongoose (MongoDB)
- JWT (Authentication)
- Joi (Validation)
- Nodemailer (OTP Email)

### Frontend
- React 18
- React Router DOM 6
- Redux Toolkit
- Axios
- Swiper.js
- Tailwind CSS
- React Icons
- React Hot Toast

## Người dùng test

Sau khi chạy seed, bạn có thể đăng ký tài khoản mới hoặc sử dụng tài khoản đã có.

## Giấy phép

MIT License
