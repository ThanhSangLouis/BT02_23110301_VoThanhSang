const Voucher = require('./voucher.model');
const VoucherRedemption = require('./voucherRedemption.model');
const { ApiResponse } = require('../../shared/utils/apiResponse');
const { AppError } = require('../../shared/errors/AppError');

const pickBestTier = (tiers, orderSubtotal) => {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const applicable = tiers
    .filter((t) => Number(orderSubtotal) >= Number(t.minOrderValue || 0))
    .sort((a, b) => Number(b.minOrderValue) - Number(a.minOrderValue));
  return applicable[0] || null;
};

const calcDiscountAmount = (tier, orderSubtotal) => {
  if (!tier) return 0;
  const subtotal = Number(orderSubtotal) || 0;

  let discount = 0;
  if (tier.discountType === 'percent') {
    discount = (subtotal * Number(tier.discountValue || 0)) / 100;
  } else {
    discount = Number(tier.discountValue || 0);
  }

  if (tier.maxDiscount != null) {
    discount = Math.min(discount, Number(tier.maxDiscount));
  }

  discount = Math.max(0, Math.min(discount, subtotal));
  return Math.floor(discount);
};

const ensureVoucherActive = (voucher) => {
  const now = new Date();
  if (!voucher || voucher.isActive === false) {
    throw new AppError('Voucher không hợp lệ', 400);
  }
  if (voucher.startDate && now < new Date(voucher.startDate)) {
    throw new AppError('Voucher chưa bắt đầu', 400);
  }
  if (voucher.endDate && now > new Date(voucher.endDate)) {
    throw new AppError('Voucher đã hết hạn', 400);
  }
};

// POST /api/vouchers/validate
const validateVoucher = async (req, res) => {
  const userId = req.user._id;
  const { code, orderSubtotal } = req.body;

  if (!code) throw new AppError('Thiếu mã voucher', 400);
  const normalized = String(code).trim().toUpperCase();

  const voucher = await Voucher.findOne({ code: normalized }).lean();
  ensureVoucherActive(voucher);

  if (voucher.usageLimitTotal != null && voucher.usedCount >= voucher.usageLimitTotal) {
    throw new AppError('Voucher đã hết lượt sử dụng', 400);
  }

  const usedByUser = await VoucherRedemption.countDocuments({ voucherId: voucher._id, userId });
  if (voucher.usageLimitPerUser != null && usedByUser >= voucher.usageLimitPerUser) {
    throw new AppError('Bạn đã dùng voucher này đủ số lần', 400);
  }

  const tier = pickBestTier(voucher.tiers, orderSubtotal);
  if (!tier) throw new AppError('Đơn hàng chưa đạt điều kiện áp dụng voucher', 400);

  const discountAmount = calcDiscountAmount(tier, orderSubtotal);

  res.status(200).json(
    ApiResponse.success(
      {
        voucher: {
          _id: voucher._id,
          code: voucher.code,
          title: voucher.title,
          description: voucher.description,
        },
        tier,
        discountAmount,
      },
      'Voucher hợp lệ'
    )
  );
};

// Admin CRUD
const getVouchersAdmin = async (req, res) => {
  const { page = 1, limit = 20, q = '' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const query = q
    ? { code: { $regex: q.trim(), $options: 'i' } }
    : {};

  const [vouchers, total] = await Promise.all([
    Voucher.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Voucher.countDocuments(query),
  ]);

  res.status(200).json(
    ApiResponse.success(
      {
        vouchers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      'Lấy vouchers thành công'
    )
  );
};

const createVoucherAdmin = async (req, res) => {
  const payload = req.body || {};
  if (!payload.code) throw new AppError('Thiếu code', 400);

  payload.code = String(payload.code).trim().toUpperCase();

  const tiers = Array.isArray(payload.tiers) ? payload.tiers : [];
  if (tiers.length === 0) throw new AppError('Voucher phải có ít nhất 1 tier', 400);

  const voucher = await Voucher.create({
    code: payload.code,
    title: payload.title || '',
    description: payload.description || '',
    isActive: payload.isActive !== false,
    startDate: payload.startDate || null,
    endDate: payload.endDate || null,
    tiers,
    usageLimitTotal: payload.usageLimitTotal ?? null,
    usageLimitPerUser: payload.usageLimitPerUser ?? 1,
  });

  res.status(201).json(ApiResponse.success(voucher.toJSON(), 'Tạo voucher thành công'));
};

const updateVoucherAdmin = async (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};

  if (payload.code) payload.code = String(payload.code).trim().toUpperCase();

  const updated = await Voucher.findByIdAndUpdate(id, payload, { new: true }).lean();
  if (!updated) throw new AppError('Không tìm thấy voucher', 404);

  res.status(200).json(ApiResponse.success(updated, 'Cập nhật voucher thành công'));
};

const deleteVoucherAdmin = async (req, res) => {
  const { id } = req.params;
  const deleted = await Voucher.findByIdAndDelete(id).lean();
  if (!deleted) throw new AppError('Không tìm thấy voucher', 404);

  res.status(200).json(ApiResponse.success(true, 'Xóa voucher thành công'));
};

module.exports = {
  validateVoucher,
  getVouchersAdmin,
  createVoucherAdmin,
  updateVoucherAdmin,
  deleteVoucherAdmin,
  pickBestTier,
  calcDiscountAmount,
};
