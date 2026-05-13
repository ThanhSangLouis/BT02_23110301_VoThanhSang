const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sách là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tên sách không được vượt quá 200 ký tự'],
    },
    slug: {
      type: String,
      required: [true, 'Slug là bắt buộc'],
      lowercase: true,
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Tác giả là bắt buộc'],
      trim: true,
      maxlength: [100, 'Tên tác giả không được vượt quá 100 ký tự'],
    },
    publisher: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Nhà xuất bản không được vượt quá 100 ký tự'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Danh mục là bắt buộc'],
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Giá là bắt buộc'],
      min: [0, 'Giá không được nhỏ hơn 0'],
    },
    salePrice: {
      type: Number,
      default: null,
      min: [0, 'Giá khuyến mãi không được nhỏ hơn 0'],
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng tồn không được nhỏ hơn 0'],
    },
    soldQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng đã bán không được nhỏ hơn 0'],
    },
    images: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
      default: null,
    },
    isbn: {
      type: String,
      default: '',
    },
    publishYear: {
      type: Number,
      default: null,
    },
    pages: {
      type: Number,
      default: null,
    },
    language: {
      type: String,
      default: 'Tiếng Việt',
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
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
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1 });
ProductSchema.index({ author: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isNew: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isBestseller: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ soldQuantity: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: 'text', author: 'text', description: 'text' });

// Virtual for discount percentage
ProductSchema.virtual('discountPercent').get(function () {
  if (this.salePrice && this.price > this.salePrice) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for is on sale
ProductSchema.virtual('isOnSale').get(function () {
  return this.salePrice && this.salePrice < this.price;
});

// Ensure virtuals are included in JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

// Static method to generate slug
ProductSchema.statics.generateSlug = function (name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
};

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
