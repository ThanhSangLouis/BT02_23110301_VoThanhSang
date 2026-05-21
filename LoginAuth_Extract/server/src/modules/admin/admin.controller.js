const { Order } = require('../order/order.model');
const Product = require('../product/product.model');
const User = require('../user/user.model');
const Category = require('../category/category.model');
const { ApiResponse } = require('../../shared/utils/apiResponse');
const AppError = require('../../shared/errors/AppError');

// ── Dashboard Stats ────────────────────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, totalUsers, totalProducts, todayOrders, recentOrders] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'username email'),
    ]);

    res.json(ApiResponse.success({
      totalOrders,
      totalUsers,
      totalProducts,
      todayOrders,
      recentOrders,
    }));
  } catch (error) {
    next(error);
  }
};

// ── Orders ─────────────────────────────────────────────────────────────────────
const getOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'username email'),
      Order.countDocuments(query),
    ]);

    res.json(ApiResponse.success({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }));
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'username email');

    if (!order) {
      throw new AppError('Không tìm thấy đơn hàng', 404);
    }

    res.json(ApiResponse.success(order));
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'preparing', 'shipping', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw new AppError('Trạng thái không hợp lệ', 400);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError('Không tìm thấy đơn hàng', 404);
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      note: `Cập nhật bởi admin: ${req.user.username}`,
    });
    await order.save();

    res.json(ApiResponse.success(order, 'Cập nhật trạng thái thành công'));
  } catch (error) {
    next(error);
  }
};

// ── Products ───────────────────────────────────────────────────────────────────
const getProducts = async (req, res, next) => {
  try {
    const { search, category, isActive, page = 1, limit = 100 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('category', 'name slug'),
      Product.countDocuments(query),
    ]);

    res.json(ApiResponse.success({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }));
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');

    if (!product) {
      throw new AppError('Không tìm thấy sản phẩm', 404);
    }

    res.json(ApiResponse.success(product));
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.category) delete data.category;
    
    const product = new Product(data);
    await product.save();
    res.status(201).json(ApiResponse.success(product, 'Tạo sản phẩm thành công'));
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      throw new AppError('Không tìm thấy sản phẩm', 404);
    }

    res.json(ApiResponse.success(product, 'Cập nhật sản phẩm thành công'));
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new AppError('Không tìm thấy sản phẩm', 404);
    }

    res.json(ApiResponse.success(null, 'Xóa sản phẩm thành công'));
  } catch (error) {
    next(error);
  }
};

// ── Users ─────────────────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    res.json(ApiResponse.success({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }));
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404);
    }

    res.json(ApiResponse.success(user));
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { email, username, password, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new AppError('Email hoặc username đã tồn tại', 400);
    }

    const user = new User({ email, username, password, role, isVerified: true });
    await user.save();

    res.status(201).json(ApiResponse.success(user.toPublicProfile(), 'Tạo người dùng thành công'));
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;

    // Convert old roles to new role
    if (updateData.role === 'student' || updateData.role === 'teacher') {
      updateData.role = 'customer';
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404);
    }

    Object.assign(user, updateData);
    if (password) user.password = password;
    await user.save();

    res.json(ApiResponse.success(user.toPublicProfile(), 'Cập nhật người dùng thành công'));
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404);
    }

    if (user.role === 'admin') {
      throw new AppError('Không thể xóa tài khoản admin', 400);
    }

    res.json(ApiResponse.success(null, 'Xóa người dùng thành công'));
  } catch (error) {
    next(error);
  }
};

// ── Categories ─────────────────────────────────────────────────────────────────
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(ApiResponse.success(categories));
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(ApiResponse.success(category, 'Tạo danh mục thành công'));
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new AppError('Không tìm thấy danh mục', 404);
    }

    res.json(ApiResponse.success(category, 'Cập nhật danh mục thành công'));
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      throw new AppError('Không tìm thấy danh mục', 404);
    }

    res.json(ApiResponse.success(null, 'Xóa danh mục thành công'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
