const mongoose = require('mongoose');

const { Schema } = mongoose;

const PromotionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề khuyến mãi là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự'],
    },
    slug: {
      type: String,
      required: [true, 'Slug là bắt buộc'],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountPercent: {
      type: Number,
      required: [true, 'Phần trăm giảm giá là bắt buộc'],
      min: [0, 'Phần trăm giảm giá không được nhỏ hơn 0'],
      max: [100, 'Phần trăm giảm giá không được vượt quá 100'],
    },
    image: {
      type: String,
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, 'Ngày bắt đầu là bắt buộc'],
    },
    endDate: {
      type: Date,
      required: [true, 'Ngày kết thúc là bắt buộc'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    link: {
      type: String,
      default: null,
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

// Indexes
PromotionSchema.index({ slug: 1 }, { unique: true });
PromotionSchema.index({ isActive: 1 });
PromotionSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if promotion is currently active
PromotionSchema.virtual('isCurrentlyActive').get(function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

PromotionSchema.set('toJSON', { virtuals: true });
PromotionSchema.set('toObject', { virtuals: true });

// Static method to generate slug
PromotionSchema.statics.generateSlug = function (title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const Promotion = mongoose.model('Promotion', PromotionSchema);

module.exports = Promotion;
