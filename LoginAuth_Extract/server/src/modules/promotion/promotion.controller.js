const Promotion = require('./promotion.model');
const { ApiResponse } = require('../../shared/utils/apiResponse');
const { AppError } = require('../../shared/errors/AppError');

// GET /api/promotions - Lấy tất cả khuyến mãi đang active
const getActivePromotions = async (req, res) => {
  const now = new Date();
  
  const promotions = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(ApiResponse.success(promotions, 'Lấy danh sách khuyến mãi thành công'));
};

// GET /api/promotions/featured - Lấy khuyến mãi nổi bật (banner)
const getFeaturedPromotions = async (req, res) => {
  const { limit = 5 } = req.query;
  const now = new Date();
  
  const promotions = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  res.status(200).json(ApiResponse.success(promotions, 'Lấy khuyến mãi nổi bật thành công'));
};

// GET /api/promotions/:slug - Lấy chi tiết khuyến mãi
const getPromotionBySlug = async (req, res) => {
  const { slug } = req.params;
  const now = new Date();
  
  const promotion = await Promotion.findOne({
    slug,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).lean();

  if (!promotion) {
    throw new AppError('Không tìm thấy khuyến mãi', 404);
  }

  res.status(200).json(ApiResponse.success(promotion, 'Lấy thông tin khuyến mãi thành công'));
};

module.exports = {
  getActivePromotions,
  getFeaturedPromotions,
  getPromotionBySlug,
};
