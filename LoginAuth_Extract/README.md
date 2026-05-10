## Login/Auth files extracted

Source: `SmartEnglish-Learning-Platform/server/src`

This extract includes files related to:
- Login with JWT
- Request validation (Joi middleware/schema)
- Rate limiting middleware
- Authentication + authorization middleware
- User profile endpoint

## Frontend demo added

Path: `LoginAuth_Extract/frontend`

Includes:
- `index.html`: login form
- `login.js`: call `POST /api/auth/login`, save JWT, redirect by role
- `user/profile.html`: profile page for non-admin roles (`/user/profile`)
- `admin/profile.html`: profile page for admin role (`/admin/profile`)
- `profile.js`: call `GET /api/users/me` with Bearer token
- `styles.css`: minimal UI styling

Run frontend quickly (from `LoginAuth_Extract/frontend`):
- `python -m http.server 5173`
- Open `http://localhost:5173`

### Current implementation notes
- Existing profile route in source is `GET /api/users/me` (not `/user/profile`).
- Existing user roles are `admin`, `student`, `teacher` (`student` can be mapped to `user` if your assignment requires `user`).
- `authorize(...roles)` middleware exists in `middleware/auth.middleware.js` and can enforce role-based access.
