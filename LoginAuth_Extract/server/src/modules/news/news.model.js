const mongoose = require('mongoose');

const { Schema } = mongoose;

const NewsSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề tin tức là bắt buộc'],
      trim: true,
      maxlength: [300, 'Tiêu đề không được vượt quá 300 ký tự'],
    },
    slug: {
      type: String,
      required: [true, 'Slug là bắt buộc'],
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    excerpt: {
      type: String,
      default: '',
      maxlength: [500, 'Tóm tắt không được vượt quá 500 ký tự'],
    },
    image: {
      type: String,
      default: null,
    },
    author: {
      type: String,
      default: 'Admin',
      maxlength: [100, 'Tên tác giả không được vượt quá 100 ký tự'],
    },
    category: {
      type: String,
      default: 'Tin tức',
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    viewCount: {
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
NewsSchema.index({ slug: 1 }, { unique: true });
NewsSchema.index({ isActive: 1 });
NewsSchema.index({ isFeatured: 1 });
NewsSchema.index({ createdAt: -1 });
NewsSchema.index({ title: 'text', content: 'text' });

// Static method to generate slug
NewsSchema.statics.generateSlug = function (title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
};

const News = mongoose.model('News', NewsSchema);

module.exports = News;
