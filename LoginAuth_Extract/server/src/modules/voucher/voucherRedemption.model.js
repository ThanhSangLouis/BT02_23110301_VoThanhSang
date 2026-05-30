const mongoose = require('mongoose');

const { Schema } = mongoose;

const VoucherRedemptionSchema = new Schema(
  {
    voucherId: {
      type: Schema.Types.ObjectId,
      ref: 'Voucher',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

VoucherRedemptionSchema.index({ voucherId: 1, userId: 1, orderId: 1 }, { unique: true });
VoucherRedemptionSchema.index({ voucherId: 1, userId: 1 });

module.exports = mongoose.model('VoucherRedemption', VoucherRedemptionSchema);
