const { ApiResponse } = require('../shared/utils/apiResponse');

/**
 * Global error handler — must be last middleware in app.js (4 params required by Express).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[Error] ${statusCode} — ${err.message}`);
  if (isDev && err.stack) console.error(err.stack);

  // Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json(ApiResponse.error('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', details));
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json(ApiResponse.error(`${field} đã tồn tại`, 'DUPLICATE_KEY'));
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    return res.status(400).json(ApiResponse.error('ID không hợp lệ', 'INVALID_ID'));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.error('Token không hợp lệ', 'INVALID_TOKEN'));
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.error('Token đã hết hạn', 'TOKEN_EXPIRED'));
  }

  // Operational errors (AppError)
  if (err.isOperational) {
    return res.status(statusCode).json(ApiResponse.error(err.message, `HTTP_${statusCode}`));
  }

  // Unknown errors
  const message = isDev ? err.message : 'Đã có lỗi xảy ra';
  return res.status(500).json(ApiResponse.error(message, 'INTERNAL_ERROR'));
};

module.exports = { errorHandler };
