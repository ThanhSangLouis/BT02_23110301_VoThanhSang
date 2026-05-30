const { PointLedger } = require('./points.model');
const { ApiResponse } = require('../../shared/utils/apiResponse');

// GET /api/points/me
const getMyPoints = async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Number(limit) || 20, 50);
  const skip = (pageNum - 1) * limitNum;

  const [ledgers, total] = await Promise.all([
    PointLedger.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    PointLedger.countDocuments({ userId }),
  ]);

  res.status(200).json(
    ApiResponse.success(
      {
        pointsBalance: req.user.pointsBalance || 0,
        ledger: ledgers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      'Lấy thông tin điểm tích lũy thành công'
    )
  );
};

module.exports = {
  getMyPoints,
};
