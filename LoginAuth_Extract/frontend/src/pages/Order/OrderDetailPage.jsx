import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaBox, FaMapMarkerAlt, FaPhone, FaUser, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { fetchOrderById, cancelOrder, requestOrderCancellation } from '../../store/slices/orderSlice';
import { createReview } from '../../store/slices/reviewSlice';
import { fetchMyPoints } from '../../store/slices/pointsSlice';
import { loadUser } from '../../store/slices/authSlice';
import Layout from '../../components/Layout/Layout';
import OrderStatusTracker from '../../components/OrderStatusTracker/OrderStatusTracker';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { currentOrder, loading, error } = useSelector((state) => state.order);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showRequestCancelModal, setShowRequestCancelModal] = useState(false);
  const [requestCancelReason, setRequestCancelReason] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!currentOrder || !['new', 'confirmed'].includes(currentOrder.orderStatus)) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const createdTime = new Date(currentOrder.createdAt).getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      const expiresAt = createdTime + thirtyMinutes;
      const now = Date.now();
      const remaining = expiresAt - now;

      if (remaining <= 0) {
        setTimeRemaining(null);
      } else {
        const minutes = Math.floor(remaining / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeRemaining({ minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentOrder]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  const canCancel = () => {
    if (!currentOrder) return false;
    // Có thể hủy trực tiếp khi: đang ở trạng thái 'new' hoặc 'confirmed' VÀ chưa hết thời gian 30 phút
    return ['new', 'confirmed'].includes(currentOrder.orderStatus) && timeRemaining !== null;
  };

  const canRequestCancel = () => {
    if (!currentOrder) return false;
    // Từ PREPARING trở đi thì không được hủy trực tiếp, phải gửi yêu cầu hủy
    return ['preparing', 'shipping'].includes(currentOrder.orderStatus);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn');
      return;
    }

    try {
      await dispatch(cancelOrder({ orderId, reason: cancelReason })).unwrap();
      toast.success('Hủy đơn hàng thành công');
      setShowCancelModal(false);
    } catch (err) {
      toast.error(err || 'Hủy đơn hàng thất bại');
    }
  };

  const handleRequestCancel = async () => {
    if (!requestCancelReason.trim()) {
      toast.error('Vui lòng nhập lý do yêu cầu hủy');
      return;
    }

    try {
      await dispatch(requestOrderCancellation({ orderId, reason: requestCancelReason })).unwrap();
      toast.success('Gửi yêu cầu hủy thành công');
      dispatch(fetchOrderById(orderId));
      setShowRequestCancelModal(false);
    } catch (err) {
      toast.error(err || 'Gửi yêu cầu hủy thất bại');
    }
  };

  const handleOpenReview = (item) => {
    setReviewProduct(item);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewProduct) return;

    try {
      const result = await dispatch(
        createReview({
          productId: reviewProduct.productId,
          orderId,
          rating: reviewRating,
          comment: reviewComment,
        })
      ).unwrap();

      const rewardedPoints = result?.reward?.points || 0;
      toast.success(rewardedPoints > 0 ? `Đánh giá thành công (+${rewardedPoints} điểm)` : 'Đánh giá thành công');

      setShowReviewModal(false);
      setReviewProduct(null);
      dispatch(fetchOrderById(orderId));
      dispatch(fetchMyPoints({ page: 1, limit: 20 }));
      dispatch(loadUser());
    } catch (err) {
      toast.error(err || 'Gửi đánh giá thất bại');
    }
  };

  if (loading && !currentOrder) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentOrder) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-xl mb-4">Không tìm thấy đơn hàng</h1>
          <Link to="/orders" className="text-blue-600 hover:underline">
            ← Quay lại danh sách đơn hàng
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/orders"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaBox className="text-blue-600" />
                  <h2 className="text-lg font-semibold">Mã đơn hàng</h2>
                </div>
                <span className="font-mono font-bold text-lg">{currentOrder.orderNumber}</span>
              </div>

              {['new', 'confirmed'].includes(currentOrder.orderStatus) && timeRemaining && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-blue-600" />
                    <span className="text-blue-700">
                      Bạn có thể hủy đơn trong{' '}
                      <span className="font-bold">
                        {timeRemaining.minutes}:{timeRemaining.seconds.toString().padStart(2, '0')}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Đặt ngày: {formatDate(currentOrder.createdAt)}
              </div>
            </div>

            <OrderStatusTracker
              status={currentOrder.orderStatus}
              statusHistory={currentOrder.statusHistory}
            />

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Sản phẩm đã đặt</h2>

              <div className="space-y-4">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                    <img
                      src={item.coverImage || 'https://via.placeholder.com/80'}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.author}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600">
                          {item.price.toLocaleString()}đ x {item.quantity}
                        </p>
                        <p className="font-semibold text-blue-600">
                          {item.subtotal.toLocaleString()}đ
                        </p>
                      </div>

                      {currentOrder.orderStatus === 'delivered' && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleOpenReview(item)}
                            className="px-3 py-2 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                          >
                            Đánh giá sản phẩm
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{currentOrder.subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>{currentOrder.shippingFee.toLocaleString()}đ</span>
                </div>

                {(currentOrder.discounts?.voucherDiscount || 0) > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>
                      Giảm voucher{currentOrder.discounts?.voucherCode ? ` (${currentOrder.discounts.voucherCode})` : ''}
                    </span>
                    <span>-{Number(currentOrder.discounts?.voucherDiscount || 0).toLocaleString()}đ</span>
                  </div>
                )}

                {(currentOrder.discounts?.pointsDiscount || 0) > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Giảm bằng điểm</span>
                    <span>-{Number(currentOrder.discounts?.pointsDiscount || 0).toLocaleString()}đ</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Cần thanh toán</span>
                  <span className="text-blue-600">
                    {Number((currentOrder.totalPayable ?? currentOrder.totalAmount) || 0).toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            {(canCancel() || canRequestCancel()) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                {canCancel() && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-3 border-2 border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Hủy đơn hàng
                  </button>
                )}
                {canRequestCancel() && (
                  <button
                    onClick={() => setShowRequestCancelModal(true)}
                    className="w-full py-3 border-2 border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    Gửi yêu cầu hủy đơn
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-blue-600" />
                <h2 className="text-lg font-semibold">Địa chỉ giao hàng</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaUser className="text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">{currentOrder.shippingInfo.fullName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaPhone className="text-gray-400 mt-1" />
                  <div>
                    <p>{currentOrder.shippingInfo.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-gray-400 mt-1" />
                  <div>
                    <p>{currentOrder.shippingInfo.address}</p>
                  </div>
                </div>
                {currentOrder.shippingInfo.note && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-500">Ghi chú:</p>
                    <p className="text-sm">{currentOrder.shippingInfo.note}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
              </div>
            </div>
          </div>
        </div>

        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <FaTimes className="text-red-500" />
                <h3 className="text-lg font-semibold">Hủy đơn hàng</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Bạn có chắc muốn hủy đơn hàng này không? Vui lòng nhập lý do hủy.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Lý do hủy đơn..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {showRequestCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <FaExclamationTriangle className="text-orange-500" />
                <h3 className="text-lg font-semibold">Gửi yêu cầu hủy đơn</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Đơn hàng đang được xử lý. Bạn có thể gửi yêu cầu hủy và Shop sẽ xem xét.
              </p>
              <textarea
                value={requestCancelReason}
                onChange={(e) => setRequestCancelReason(e.target.value)}
                placeholder="Lý do yêu cầu hủy..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestCancelModal(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleRequestCancel}
                  disabled={loading}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </div>
          </div>
        )}

        {showReviewModal && reviewProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Đánh giá sản phẩm</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Đóng"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mb-3">
                <p className="font-medium text-gray-800">{reviewProduct.name}</p>
                <p className="text-sm text-gray-500">{reviewProduct.author}</p>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-1">Số sao</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} sao</option>
                ))}
              </select>

              <label className="block text-sm font-medium text-gray-700 mb-1">Nhận xét</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn..."
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Gửi đánh giá
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Mỗi đơn hàng chỉ được tặng điểm thưởng đánh giá 1 lần.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
