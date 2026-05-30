const { Order, ORDER_STATUS } = require('../order/order.model');
const Review = require('./review.model');
const { PointLedger, POINT_LEDGER_TYPE } = require('../points/points.model');
const Product = require('../product/product.model');
const User = require('../user/user.model');
const { ApiResponse } = require('../../shared/utils/apiResponse');
const AppError = require('../../shared/errors/AppError');

const REVIEW_REWARD_POINTS_PER_ORDER = 200;

// POST /api/reviews
const createReview = async (req, res) => {
  const userId = req.user._id;
  const { productId, orderId, rating, comment = '' } = req.body;

  if (!productId || !orderId) {
    throw new AppError('Thiếu productId hoặc orderId', 400);
  }

  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new AppError('rating không hợp lệ (1-5)', 400);
  }

  const order = await Order.findOne({ _id: orderId, userId }).lean();
  if (!order) {
    throw new AppError('Không tìm thấy đơn hàng', 404);
  }

  if (order.orderStatus !== ORDER_STATUS.DELIVERED) {
    throw new AppError('Chỉ có thể đánh giá khi đơn hàng đã giao thành công', 400);
  }

  const hasProduct = Array.isArray(order.items)
    && order.items.some((it) => it.productId?.toString() === productId.toString());

  if (!hasProduct) {
    throw new AppError('Sản phẩm không thuộc đơn hàng này', 400);
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new AppError('Không tìm thấy sản phẩm', 404);
  }

  let review;
  try {
    review = await Review.create({
      userId,
      productId,
      orderId,
      rating: numericRating,
      comment,
    });
  } catch (e) {
    if (e?.code === 11000) {
      throw new AppError('Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi', 400);
    }
    throw e;
  }

  // Update product rating aggregates (simple approach)
  const stats = await Review.aggregate([
    { $match: { productId: product._id } },
    {
      $group: {
        _id: '$productId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats[0]?.avgRating || 0;
  const count = stats[0]?.count || 0;
  await Product.findByIdAndUpdate(product._id, { rating: avgRating, reviewCount: count });

  // Reward points once per order (only first successful review for that order)
  const alreadyRewarded = await PointLedger.findOne({
    userId,
    type: POINT_LEDGER_TYPE.EARN_REVIEW_ORDER,
    refType: 'order',
    refId: order._id,
  }).lean();

  let rewarded = false;
  if (!alreadyRewarded) {
    try {
      await PointLedger.create({
        userId,
        type: POINT_LEDGER_TYPE.EARN_REVIEW_ORDER,
        points: REVIEW_REWARD_POINTS_PER_ORDER,
        refType: 'order',
        refId: order._id,
      });

      await User.findByIdAndUpdate(userId, { $inc: { pointsBalance: REVIEW_REWARD_POINTS_PER_ORDER } });
      rewarded = true;
    } catch (e) {
      // If another parallel request created ledger first, ignore
      if (e?.code !== 11000) throw e;
    }
  }

  res.status(201).json(
    ApiResponse.success(
      {
        review,
        reward: {
          points: rewarded ? REVIEW_REWARD_POINTS_PER_ORDER : 0,
          rewarded,
          note: rewarded
            ? 'Đã cộng điểm thưởng cho đơn hàng'
            : 'Đơn hàng này đã được cộng điểm thưởng trước đó',
        },
      },
      'Tạo đánh giá thành công'
    )
  );
};

// GET /api/reviews/product/:productId
const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Number(limit) || 10, 50);
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total, stats] = await Promise.all([
    Review.find({ productId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments({ productId }),
    Review.aggregate([
      { $match: { productId: require('mongoose').Types.ObjectId.createFromHexString(productId) } },
      {
        $group: {
          _id: '$productId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  res.status(200).json(
    ApiResponse.success(
      {
        reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        summary: {
          avgRating: stats[0]?.avgRating || 0,
          reviewCount: stats[0]?.count || 0,
        },
      },
      'Lấy đánh giá sản phẩm thành công'
    )
  );
};

module.exports = {
  createReview,
  getReviewsByProduct,
};
