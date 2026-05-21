const { Order, ORDER_STATUS, PAYMENT_STATUS } = require('./order.model');
const { CancellationRequest } = require('../cancellation/cancellation.model');
const Cart = require('../cart/cart.model');
const Product = require('../product/product.model');
const { ApiResponse } = require('../../shared/utils/apiResponse');
const AppError = require('../../shared/errors/AppError');

const SHIPPING_FEE = 30000;
const AUTO_CONFIRM_DELAY = 30 * 60 * 1000;

const autoConfirmJobs = new Map();

const scheduleAutoConfirm = (order) => {
  const timeoutId = setTimeout(async () => {
    try {
      const currentOrder = await Order.findById(order._id);
      if (currentOrder && currentOrder.orderStatus === ORDER_STATUS.NEW) {
        currentOrder.orderStatus = ORDER_STATUS.CONFIRMED;
        currentOrder.statusHistory.push({
          status: ORDER_STATUS.CONFIRMED,
          changedAt: new Date(),
          note: 'Tự động xác nhận sau 30 phút',
        });
        await currentOrder.save();
      }
      autoConfirmJobs.delete(order._id.toString());
    } catch (error) {
      console.error('Auto confirm error:', error);
      autoConfirmJobs.delete(order._id.toString());
    }
  }, AUTO_CONFIRM_DELAY);

  autoConfirmJobs.set(order._id.toString(), timeoutId);
};

const cancelScheduledJob = (orderId) => {
  const timeoutId = autoConfirmJobs.get(orderId.toString());
  if (timeoutId) {
    clearTimeout(timeoutId);
    autoConfirmJobs.delete(orderId.toString());
  }
};

const createOrder = async (req, res) => {
  const { shippingInfo, paymentMethod = 'COD' } = req.body;
  const userId = req.user._id;

  if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
    throw new AppError('Thông tin giao hàng không đầy đủ', 400);
  }

  const phoneRegex = /^(0[0-9]{9,10})$/;
  if (!phoneRegex.test(shippingInfo.phone)) {
    throw new AppError('Số điện thoại không hợp lệ', 400);
  }

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    throw new AppError('Giỏ hàng trống', 400);
  }

  const selectedItems = cart.items.filter((item) => item.selected);
  if (selectedItems.length === 0) {
    throw new AppError('Vui lòng chọn ít nhất một sản phẩm để đặt hàng', 400);
  }

  const stockErrors = [];
  const validItems = [];

  for (const item of selectedItems) {
    const product = await Product.findById(item.productId).lean();
    if (!product) {
      stockErrors.push(`${item.name}: Sản phẩm không tồn tại`);
      continue;
    }
    if (!product.isActive) {
      stockErrors.push(`${item.name}: Sản phẩm không còn khả dụng`);
      continue;
    }
    if (product.stockQuantity < item.quantity) {
      stockErrors.push(
        `${item.name}: Chỉ còn ${product.stockQuantity} sản phẩm`
      );
      continue;
    }

    validItems.push({
      productId: product._id,
      name: item.name,
      author: item.author,
      coverImage: item.coverImage,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    });
  }

  if (validItems.length === 0) {
    throw new AppError(
      `Không có sản phẩm nào có thể đặt hàng: ${stockErrors.join('; ')}`,
      400
    );
  }

  const subtotal = validItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingFee = SHIPPING_FEE;
  const totalAmount = subtotal + shippingFee;

  const orderNumber = await Order.generateOrderNumber();

  const order = new Order({
    userId,
    orderNumber,
    items: validItems,
    shippingInfo,
    subtotal,
    shippingFee,
    totalAmount,
    paymentMethod,
    paymentStatus: PAYMENT_STATUS.PENDING,
    orderStatus: ORDER_STATUS.NEW,
    statusHistory: [
      {
        status: ORDER_STATUS.NEW,
        changedAt: new Date(),
        note: 'Đơn hàng mới được tạo',
      },
    ],
  });

  await order.save();

  for (const item of validItems) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stockQuantity: -item.quantity, soldQuantity: item.quantity },
    });
  }

  const remainingItems = cart.items.filter(
    (item) => !validItems.find((v) => v.productId.toString() === item.productId.toString())
  );
  cart.items = remainingItems;
  await cart.save();

  scheduleAutoConfirm(order);

  res.status(201).json(
    ApiResponse.success(
      {
        order,
        stockErrors: stockErrors.length > 0 ? stockErrors : undefined,
        message: stockErrors.length > 0
          ? 'Đặt hàng thành công (một số sản phẩm không đủ số lượng)'
          : 'Đặt hàng thành công',
      },
      'Tạo đơn hàng thành công'
    )
  );
};

const getOrders = async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  const query = { userId };
  if (status) {
    query.orderStatus = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json(
    ApiResponse.success(
      {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Lấy danh sách đơn hàng thành công'
    )
  );
};

const getOrderById = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const order = await Order.findOne({ _id: orderId, userId }).lean();

  if (!order) {
    throw new AppError('Không tìm thấy đơn hàng', 404);
  }

  const cancellationRequest = await CancellationRequest.findOne({
    orderId,
  }).lean();

  res.status(200).json(
    ApiResponse.success(
      {
        order,
        cancellationRequest,
      },
      'Lấy chi tiết đơn hàng thành công'
    )
  );
};

const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) {
    throw new AppError('Không tìm thấy đơn hàng', 404);
  }

  if (!order.canBeCancelledByUser()) {
    throw new AppError(
      'Không thể hủy đơn hàng. Bạn chỉ có thể hủy trong vòng 30 phút kể từ khi đặt hàng và khi đơn hàng còn ở trạng thái mới.',
      400
    );
  }

  cancelScheduledJob(orderId);

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stockQuantity: item.quantity, soldQuantity: -item.quantity },
    });
  }

  order.orderStatus = ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date();
  order.cancellationReason = reason || 'Khách hàng hủy đơn';
  order.statusHistory.push({
    status: ORDER_STATUS.CANCELLED,
    changedAt: new Date(),
    note: reason || 'Khách hàng hủy đơn',
  });

  await order.save();

  res.status(200).json(
    ApiResponse.success({ order }, 'Hủy đơn hàng thành công')
  );
};

const requestCancellation = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  if (!reason || reason.trim().length === 0) {
    throw new AppError('Vui lòng nhập lý do hủy đơn', 400);
  }

  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) {
    throw new AppError('Không tìm thấy đơn hàng', 404);
  }

  if (!order.canRequestCancellation()) {
    throw new AppError(
      'Chỉ có thể gửi yêu cầu hủy khi đơn hàng đang ở trạng thái chuẩn bị hoặc đang giao hàng',
      400
    );
  }

  const existingRequest = await CancellationRequest.findOne({ orderId });
  if (existingRequest) {
    throw new AppError('Đã có yêu cầu hủy đơn cho đơn hàng này', 400);
  }

  const cancellationRequest = new CancellationRequest({
    orderId,
    userId,
    reason,
    status: 'pending',
  });

  await cancellationRequest.save();

  res.status(201).json(
    ApiResponse.success(
      { cancellationRequest },
      'Gửi yêu cầu hủy đơn thành công'
    )
  );
};

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status, note } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Không tìm thấy đơn hàng', 404);
  }

  const validTransitions = {
    [ORDER_STATUS.NEW]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.DELIVERED]: [],
    [ORDER_STATUS.CANCELLED]: [],
  };

  if (!validTransitions[order.orderStatus]?.includes(status)) {
    throw new AppError(
      `Không thể chuyển từ trạng thái "${order.orderStatus}" sang "${status}"`,
      400
    );
  }

  if (
    status === ORDER_STATUS.CANCELLED &&
    order.orderStatus !== ORDER_STATUS.NEW
  ) {
    const cancellationRequest = await CancellationRequest.findOne({
      orderId,
      status: 'approved',
    });

    if (!cancellationRequest) {
      throw new AppError(
        'Cần duyệt yêu cầu hủy đơn trước khi hủy đơn hàng',
        400
      );
    }
  }

  if (status === ORDER_STATUS.CANCELLED) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: item.quantity, soldQuantity: -item.quantity },
      });
    }
    order.cancelledAt = new Date();
    order.cancellationReason = note || 'Shop hủy đơn';
  }

  if (status === ORDER_STATUS.DELIVERED) {
    order.actualDelivery = new Date();
  }

  cancelScheduledJob(orderId);

  order.orderStatus = status;
  order.statusHistory.push({
    status,
    changedAt: new Date(),
    note: note || '',
  });

  await order.save();

  res.status(200).json(
    ApiResponse.success({ order }, 'Cập nhật trạng thái thành công')
  );
};

const getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status, userId } = req.query;

  const query = {};
  if (status) {
    query.orderStatus = status;
  }
  if (userId) {
    query.userId = userId;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('userId', 'email username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json(
    ApiResponse.success(
      {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Lấy danh sách đơn hàng thành công'
    )
  );
};

const getCancellationRequests = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = {};
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [requests, total] = await Promise.all([
    CancellationRequest.find(query)
      .populate('orderId')
      .populate('userId', 'email username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    CancellationRequest.countDocuments(query),
  ]);

  res.status(200).json(
    ApiResponse.success(
      {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Lấy danh sách yêu cầu hủy đơn thành công'
    )
  );
};

const processCancellationRequest = async (req, res) => {
  const { requestId } = req.params;
  const { approved, shopResponse } = req.body;

  const cancellationRequest = await CancellationRequest.findById(requestId);

  if (!cancellationRequest) {
    throw new AppError('Không tìm thấy yêu cầu hủy đơn', 404);
  }

  if (cancellationRequest.status !== 'pending') {
    throw new AppError('Yêu cầu đã được xử lý', 400);
  }

  cancellationRequest.status = approved ? 'approved' : 'rejected';
  cancellationRequest.shopResponse = shopResponse || '';
  cancellationRequest.processedAt = new Date();
  await cancellationRequest.save();

  if (approved) {
    const order = await Order.findById(cancellationRequest.orderId);
    if (order && order.orderStatus !== ORDER_STATUS.CANCELLED) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQuantity: item.quantity, soldQuantity: -item.quantity },
        });
      }
      order.orderStatus = ORDER_STATUS.CANCELLED;
      order.cancelledAt = new Date();
      order.cancellationReason = `Shop duyệt hủy: ${shopResponse || ''}`;
      order.statusHistory.push({
        status: ORDER_STATUS.CANCELLED,
        changedAt: new Date(),
        note: `Shop duyệt hủy: ${shopResponse || ''}`,
      });
      await order.save();
    }
  }

  res.status(200).json(
    ApiResponse.success(
      { cancellationRequest },
      approved ? 'Đã duyệt yêu cầu hủy đơn' : 'Đã từ chối yêu cầu hủy đơn'
    )
  );
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  requestCancellation,
  updateOrderStatus,
  getAllOrders,
  getCancellationRequests,
  processCancellationRequest,
};
