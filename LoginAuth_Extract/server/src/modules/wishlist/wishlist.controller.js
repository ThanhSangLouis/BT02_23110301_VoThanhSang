const WishlistItem = require('./wishlist.model');
const Product = require('../product/product.model');
const { ApiResponse } = require('../../shared/utils/apiResponse');
const AppError = require('../../shared/errors/AppError');

// GET /api/wishlist
const getMyWishlist = async (req, res) => {
  const userId = req.user._id;

  const items = await WishlistItem.find({ userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'productId',
      select: 'name slug author price salePrice coverImage images rating reviewCount soldQuantity isActive category',
      populate: { path: 'category', select: 'name slug' },
    })
    .lean();

  const products = items
    .map((it) => it.productId)
    .filter(Boolean)
    .filter((p) => p.isActive !== false);

  res.status(200).json(ApiResponse.success({ products }, 'Lấy danh sách yêu thích thành công'));
};

// POST /api/wishlist/:productId (toggle add/remove)
const toggleWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const product = await Product.findById(productId).select('_id isActive').lean();
  if (!product || product.isActive === false) {
    throw new AppError('Không tìm thấy sản phẩm', 404);
  }

  const existing = await WishlistItem.findOne({ userId, productId }).lean();
  if (existing) {
    await WishlistItem.deleteOne({ _id: existing._id });
    return res.status(200).json(ApiResponse.success({ wished: false }, 'Đã bỏ yêu thích'));
  }

  try {
    await WishlistItem.create({ userId, productId });
  } catch (e) {
    if (e?.code !== 11000) throw e;
  }

  return res.status(201).json(ApiResponse.success({ wished: true }, 'Đã thêm vào yêu thích'));
};

// GET /api/wishlist/:productId/status
const getWishlistStatus = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const exists = await WishlistItem.exists({ userId, productId });
  res.status(200).json(ApiResponse.success({ wished: Boolean(exists) }, 'OK'));
};

module.exports = {
  getMyWishlist,
  toggleWishlist,
  getWishlistStatus,
};
