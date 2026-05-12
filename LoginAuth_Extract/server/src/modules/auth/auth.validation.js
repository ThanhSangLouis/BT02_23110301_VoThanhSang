const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Vui lòng nhập địa chỉ email hợp lệ',
    'any.required': 'Email là bắt buộc',
  }),
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Tên đăng nhập chỉ được dùng chữ cái và số',
    'string.min': 'Tên đăng nhập tối thiểu 3 ký tự',
    'string.max': 'Tên đăng nhập tối đa 30 ký tự',
    'any.required': 'Tên đăng nhập là bắt buộc',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Mật khẩu tối thiểu 8 ký tự',
      'string.pattern.base': 'Mật khẩu cần có chữ hoa, chữ thường và số',
      'any.required': 'Mật khẩu là bắt buộc',
    }),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Vui lòng nhập địa chỉ email hợp lệ',
    'any.required': 'Email là bắt buộc',
  }),
});

const verifyEmailOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Vui lòng nhập địa chỉ email hợp lệ',
    'any.required': 'Email là bắt buộc',
  }),
  otp: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'OTP phải là 6 chữ số',
    'any.required': 'OTP là bắt buộc',
  }),
});

const resetPasswordOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Vui lòng nhập địa chỉ email hợp lệ',
    'any.required': 'Email là bắt buộc',
  }),
  otp: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'OTP phải là 6 chữ số',
    'any.required': 'OTP là bắt buộc',
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Mật khẩu tối thiểu 8 ký tự',
      'string.pattern.base': 'Mật khẩu cần có chữ hoa, chữ thường và số',
      'any.required': 'Mật khẩu mới là bắt buộc',
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyEmailOtpSchema,
  resetPasswordOtpSchema,
};
