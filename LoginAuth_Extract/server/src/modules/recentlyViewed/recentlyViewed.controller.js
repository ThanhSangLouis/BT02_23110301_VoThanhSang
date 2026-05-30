const RecentlyViewed = require('./recentlyViewed.model');
const Product = require('../product/product.model');
const { ApiResponse } = require('../../shared/utils/apiResponse');
const AppError = require('../../shared/errors/AppError');

// POST /api/recently-viewed/:productId
const trackView = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const product = await Product.findById(productId).select('_id isActive').lean();
  if (!product || product.isActive === false) {
    throw new AppError('Không tìm thấy sản phẩm', 404);
  }

  await RecentlyViewed.updateOne(
    { userId, productId },
    { $set: { viewedAt: new Date() } },
    { upsert: true }
  );

  res.status(200).json(ApiResponse.success({ tracked: true }, 'Đã ghi nhận sản phẩm đã xem'));
};

// GET /api/recently-viewed
const getMyRecentlyViewed = async (req, res) => {
  const userId = req.user._id;
  const { limit = 20 } = req.query;
  const limitNum = Math.min(Number(limit) || 20, 50);

  const rows = await RecentlyViewed.find({ userId })
    .sort({ viewedAt: -1 })
    .limit(limitNum)
    .populate({
      path: 'productId',
      select: 'name slug author price salePrice coverImage images rating reviewCount soldQuantity isActive category',
      populate: { path: 'category', select: 'name slug' },
    })
    .lean();

  const products = rows
    .map((r) => r.productId)
    .filter(Boolean)
    .filter((p) => p.isActive !== false);

  res.status(200).json(ApiResponse.success({ products }, 'Lấy danh sách đã xem thành công'));
};

module.exports = {
  trackView,
  getMyRecentlyViewed,
};
