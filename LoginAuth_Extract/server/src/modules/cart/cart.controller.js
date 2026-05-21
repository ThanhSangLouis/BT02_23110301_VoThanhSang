const Cart = require('./cart.model');
const Product = require('../product/product.model');
const { ApiResponse } = require('../../shared/utils/apiResponse');
const AppError = require('../../shared/errors/AppError');

const THIRTY_MINUTES = 30 * 60 * 1000;

const getCart = async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    cart = new Cart({ userId: req.user._id, items: [] });
    await cart.save();
  }

  const selectedItems = cart.items.filter((item) => item.selected);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = subtotal > 0 ? 30000 : 0;
  const total = subtotal + shippingFee;

  res.status(200).json(
    ApiResponse.success(
      {
        cart: cart.toObject(),
        summary: {
          totalItems: cart.getTotalQuantity(),
          selectedItems: selectedItems.length,
          selectedQuantity: cart.getSelectedQuantity(),
          subtotal,
          shippingFee,
          total,
        },
      },
      'Lấy giỏ hàng thành công'
    )
  );
};

const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user._id;

  if (!productId) {
    throw new AppError('ID sản phẩm là bắt buộc', 400);
  }

  if (quantity < 1) {
    throw new AppError('Số lượng phải lớn hơn 0', 400);
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new AppError('Không tìm thấy sản phẩm', 404);
  }

  if (!product.isActive) {
    throw new AppError('Sản phẩm không còn khả dụng', 400);
  }

  if (product.stockQuantity < quantity) {
    throw new AppError(
      `Chỉ còn ${product.stockQuantity} sản phẩm trong kho`,
      400
    );
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      items: [
        {
          productId: product._id,
          name: product.name,
          author: product.author || '',
          coverImage: product.coverImage || '',
          price: product.salePrice || product.price,
          quantity,
          selected: true,
        },
      ],
    });
    await cart.save();
  } else {
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > product.stockQuantity) {
        throw new AppError(
          `Chỉ còn ${product.stockQuantity} sản phẩm trong kho`,
          400
        );
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        author: product.author || '',
        coverImage: product.coverImage || '',
        price: product.salePrice || product.price,
        quantity,
        selected: true,
      });
    }

    await cart.save();
  }

  res.status(200).json(
    ApiResponse.success(
      {
        cart,
        message: 'Thêm vào giỏ hàng thành công',
      },
      'Thêm vào giỏ hàng thành công'
    )
  );
};

const updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  if (!quantity || quantity < 1) {
    throw new AppError('Số lượng phải lớn hơn 0', 400);
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new AppError('Giỏ hàng trống', 404);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw new AppError('Sản phẩm không có trong giỏ hàng', 404);
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new AppError('Không tìm thấy sản phẩm', 404);
  }

  if (quantity > product.stockQuantity) {
    throw new AppError(`Chỉ còn ${product.stockQuantity} sản phẩm trong kho`, 400);
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  res.status(200).json(
    ApiResponse.success(
      { cart },
      'Cập nhật số lượng thành công'
    )
  );
};

const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new AppError('Giỏ hàng trống', 404);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw new AppError('Sản phẩm không có trong giỏ hàng', 404);
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  res.status(200).json(
    ApiResponse.success(
      { cart },
      'Xóa sản phẩm khỏi giỏ hàng thành công'
    )
  );
};

const clearCart = async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json(
    ApiResponse.success(
      { cart: { userId, items: [] } },
      'Xóa giỏ hàng thành công'
    )
  );
};

const toggleSelectItem = async (req, res) => {
  const { productId } = req.params;
  const { selected } = req.body;
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new AppError('Giỏ hàng trống', 404);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw new AppError('Sản phẩm không có trong giỏ hàng', 404);
  }

  cart.items[itemIndex].selected = selected !== false;
  await cart.save();

  res.status(200).json(
    ApiResponse.success(
      { cart },
      selected !== false ? 'Đã chọn sản phẩm' : 'Đã bỏ chọn sản phẩm'
    )
  );
};

const selectAllItems = async (req, res) => {
  const { selected } = req.body;
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new AppError('Giỏ hàng trống', 404);
  }

  cart.items.forEach((item) => {
    item.selected = selected !== false;
  });
  await cart.save();

  res.status(200).json(
    ApiResponse.success(
      { cart },
      selected !== false ? 'Đã chọn tất cả' : 'Đã bỏ chọn tất cả'
    )
  );
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  toggleSelectItem,
  selectAllItems,
};
