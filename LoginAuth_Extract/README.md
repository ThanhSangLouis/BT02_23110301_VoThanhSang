## Login/Auth files extracted

Source: `SmartEnglish-Learning-Platform/server/src`

This extract includes files related to:
- Login with JWT
- Request validation (Joi middleware/schema)
- Rate limiting middleware
- Authentication + authorization middleware
- User profile endpoint

### Current implementation notes
- Existing profile route in source is `GET /api/users/me` (not `/user/profile`).
- Existing user roles are `admin`, `student`, `teacher` (`student` can be mapped to `user` if your assignment requires `user`).
- `authorize(...roles)` middleware exists in `middleware/auth.middleware.js` and can enforce role-based access.
