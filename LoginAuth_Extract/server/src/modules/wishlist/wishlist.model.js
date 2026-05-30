const mongoose = require('mongoose');

const { Schema } = mongoose;

const WishlistItemSchema = new Schema(
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

WishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('WishlistItem', WishlistItemSchema);
