const mongoose = require('mongoose');

const { Schema } = mongoose;

const VoucherSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    title: {
      type: String,
      default: '',
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    // Tiered rules: pick best tier satisfied by orderSubtotal
    tiers: [
      {
        minOrderValue: { type: Number, required: true, min: 0 },
        discountType: { type: String, enum: ['percent', 'fixed'], required: true },
        discountValue: { type: Number, required: true, min: 0 },
        maxDiscount: { type: Number, default: null, min: 0 },
      },
    ],

    usageLimitTotal: {
      type: Number,
      default: null,
      min: 1,
    },

    usageLimitPerUser: {
      type: Number,
      default: 1,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

VoucherSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Voucher', VoucherSchema);
