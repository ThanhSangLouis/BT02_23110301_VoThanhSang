const Product = require('./product.model');
const Category = require('../category/category.model');
const { ApiResponse } = require('../../shared/utils/apiResponse');
const { AppError } = require('../../shared/errors/AppError');

// GET /api/products - Lấy danh sách sản phẩm với filter, sort, pagination
const getProducts = async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    author,
    minPrice,
    maxPrice,
    publishYear,
    search,
    sortBy = 'createdAt',
    order = 'desc',
    isNew,
    isFeatured,
    isBestseller,
  } = req.query;

  // Build query
  const query = { isActive: true };

  // Filter by category slug - lookup category first to get ObjectId
  if (category) {
    const cat = await Category.findOne({ slug: category }).lean();
    if (cat) {
      query.category = cat._id;
    }
  }

  if (author) {
    query.author = { $regex: author, $options: 'i' };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (publishYear) {
    query.publishYear = Number(publishYear);
  }

  // Search by name or author using regex (not $text which requires index)
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
    ];
  }

  if (isNew === 'true') query.isNew = true;
  if (isFeatured === 'true') query.isFeatured = true;
  if (isBestseller === 'true') query.isBestseller = true;

  // Build sort
  const sortOptions = {};
  if (sortBy === 'price') {
    sortOptions.price = order === 'asc' ? 1 : -1;
  } else if (sortBy === 'price-desc') {
    sortOptions.price = -1;
  } else if (sortBy === 'soldQuantity') {
    sortOptions.soldQuantity = -1;
  } else if (sortBy === 'name') {
    sortOptions.name = order === 'asc' ? 1 : -1;
  } else {
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(query),
  ]);

  res.status(200).json(ApiResponse.success({
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  }, 'Lấy danh sách sản phẩm thành công'));
};

// GET /api/products/new - Lấy sản phẩm mới nhất
const getNewProducts = async (req, res) => {
  const { limit = 8 } = req.query;
  const products = await Product.find({ isActive: true, isNew: true })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  res.status(200).json(ApiResponse.success(products, 'Lấy sản phẩm mới thành công'));
};

// GET /api/products/bestsellers - Lấy sản phẩm bán chạy
const getBestsellers = async (req, res) => {
  const { limit = 8 } = req.query;
  const products = await Product.find({ isActive: true })
    .populate('category', 'name slug')
    .sort({ soldQuantity: -1 })
    .limit(Number(limit))
    .lean();

  res.status(200).json(ApiResponse.success(products, 'Lấy sản phẩm bán chạy thành công'));
};

// GET /api/products/featured - Lấy sản phẩm nổi bật
const getFeaturedProducts = async (req, res) => {
  const { limit = 8 } = req.query;
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  res.status(200).json(ApiResponse.success(products, 'Lấy sản phẩm nổi bật thành công'));
};

// GET /api/products/:slug - Lấy chi tiết sản phẩm
const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isActive: true })
    .populate('category', 'name slug description')
    .lean();

  if (!product) {
    throw new AppError('Không tìm thấy sản phẩm', 404);
  }

  // Get related products (same category)
  const relatedProducts = await Product.find({
    isActive: true,
    category: product.category._id,
    _id: { $ne: product._id },
  })
    .populate('category', 'name slug')
    .sort({ soldQuantity: -1 })
    .limit(6)
    .lean();

  res.status(200).json(ApiResponse.success({
    product,
    relatedProducts,
  }, 'Lấy thông tin sản phẩm thành công'));
};

// GET /api/products/related/:id - Lấy sản phẩm tương tự
const getRelatedProducts = async (req, res) => {
  const { id } = req.params;
  const { limit = 6 } = req.query;

  const product = await Product.findById(id).lean();
  if (!product) {
    throw new AppError('Không tìm thấy sản phẩm', 404);
  }

  const relatedProducts = await Product.find({
    isActive: true,
    category: product.category,
    _id: { $ne: product._id },
  })
    .populate('category', 'name slug')
    .sort({ soldQuantity: -1 })
    .limit(Number(limit))
    .lean();

  res.status(200).json(ApiResponse.success(relatedProducts, 'Lấy sản phẩm tương tự thành công'));
};

module.exports = {
  getProducts,
  getNewProducts,
  getBestsellers,
  getFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
};
