const Joi = require('joi');

const updateProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).optional().messages({
    'string.alphanum': 'Tên đăng nhập chỉ được dùng chữ cái và số',
    'string.min': 'Tên đăng nhập tối thiểu 3 ký tự',
    'string.max': 'Tên đăng nhập tối đa 30 ký tự',
  }),
  avatar: Joi.string().uri().optional().allow('', null),
}).min(1).message('Cần ít nhất một trường để cập nhật');

module.exports = { updateProfileSchema };
