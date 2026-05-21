const { verifyAccessToken } = require('../shared/utils/jwt');
const { AppError } = require('../shared/errors/AppError');
const User = require('../modules/user/user.model');

/**
 * Verifies JWT access token.
 * Reads from HttpOnly cookie first (new flow), then falls back to
 * Authorization: Bearer header (legacy / mobile clients).
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Try HttpOnly cookie (set by login/refresh endpoints)
    let token = req.cookies?.accessToken;

    // 2. Fallback: Authorization: Bearer <token>
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return next(new AppError('Không tìm thấy token xác thực', 401));
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.sub).select('-password');
    if (!user) {
      return next(new AppError('Tài khoản không còn tồn tại', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Restricts access to specific roles.
 * Usage: authorize('admin', 'teacher')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Bạn không có quyền thực hiện hành động này', 403));
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  requireAuth: authenticate,
  requireAdmin: authorize('admin'),
};
