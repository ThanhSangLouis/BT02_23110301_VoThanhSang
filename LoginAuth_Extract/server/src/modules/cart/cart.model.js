const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  selected: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ userId: 1 });

cartSchema.methods.getSelectedItems = function () {
  return this.items.filter((item) => item.selected);
};

cartSchema.methods.getSelectedTotal = function () {
  return this.getSelectedItems().reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

cartSchema.methods.getTotalQuantity = function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

cartSchema.methods.getSelectedQuantity = function () {
  return this.getSelectedItems().reduce(
    (total, item) => total + item.quantity,
    0
  );
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
