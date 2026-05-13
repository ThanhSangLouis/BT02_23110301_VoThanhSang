const Category = require('./category.model');
const { ApiResponse } = require('../../shared/utils/apiResponse');
const { AppError } = require('../../shared/errors/AppError');

// GET /api/categories - Lấy tất cả danh mục
const getAllCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 });
  res.status(200).json(ApiResponse.success(categories, 'Lấy danh sách danh mục thành công'));
};

// GET /api/categories/:slug - Lấy danh mục theo slug
const getCategoryBySlug = async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug, isActive: true });
  
  if (!category) {
    throw new AppError('Không tìm thấy danh mục', 404);
  }
  
  res.status(200).json(ApiResponse.success(category, 'Lấy thông tin danh mục thành công'));
};

// GET /api/categories/featured - Lấy danh mục nổi bật
const getFeaturedCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ order: 1 })
    .limit(6);
  res.status(200).json(ApiResponse.success(categories, 'Lấy danh mục nổi bật thành công'));
};

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  getFeaturedCategories,
};
