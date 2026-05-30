const mongoose = require('mongoose');

const { Schema } = mongoose;

const RecentlyViewedSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
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

RecentlyViewedSchema.index({ userId: 1, productId: 1 }, { unique: true });
RecentlyViewedSchema.index({ userId: 1, viewedAt: -1 });

module.exports = mongoose.model('RecentlyViewed', RecentlyViewedSchema);
