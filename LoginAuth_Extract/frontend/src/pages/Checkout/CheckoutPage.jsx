import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaTruck, FaMoneyBillWave } from 'react-icons/fa';
import { fetchCart } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/orderSlice';
import Layout from '../../components/Layout/Layout';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, summary, loading: cartLoading } = useSelector((state) => state.cart);
  const { currentOrder, loading: orderLoading, error } = useSelector((state) => state.order);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    note: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (currentOrder) {
      toast.success('Đặt hàng thành công!');
      navigate(`/orders/${currentOrder._id}`);
    }
  }, [currentOrder, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[0-9]{9,10})$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (summary.selectedQuantity === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    try {
      await dispatch(
        createOrder({
          shippingInfo: {
            fullName: formData.fullName,
            phone: formData.phone,
            address: formData.address,
            note: formData.note,
          },
          paymentMethod: 'COD',
        })
      ).unwrap();
    } catch (err) {
      toast.error(err || 'Đặt hàng thất bại');
    }
  };

  const selectedItems = cart?.items?.filter((item) => item.selected) || [];

  if (cartLoading && !cart) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (summary.selectedQuantity === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">
              Không có sản phẩm nào được chọn
            </h2>
            <Link
              to="/cart"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/cart"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Thanh toán</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaTruck className="text-blue-600" />
                  <h2 className="text-lg font-semibold">Thông tin giao hàng</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên người nhận"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0xxx xxx xxx"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ giao hàng <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Ghi chú cho đơn hàng (ví dụ: giao giờ hành chính)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaMoneyBillWave className="text-blue-600" />
                  <h2 className="text-lg font-semibold">Phương thức thanh toán</h2>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={true}
                    readOnly
                    className="w-5 h-5 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-gray-500">Trả tiền mặt khi nhận được sản phẩm</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Đơn hàng của bạn</h2>

                <div className="space-y-3 max-h-64 overflow-y-auto pb-4 border-b">
                  {selectedItems.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <img
                        src={item.coverImage || 'https://via.placeholder.com/50'}
                        alt={item.name}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                        <p className="text-sm font-medium text-blue-600">
                          {(item.price * item.quantity).toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 py-4 border-b">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Tạm tính</span>
                    <span>{summary.subtotal.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Phí vận chuyển</span>
                    <span>{summary.shippingFee.toLocaleString()}đ</span>
                  </div>
                </div>

                <div className="py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Tổng cộng</span>
                    <span className="text-xl font-bold text-blue-600">
                      {summary.total.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={orderLoading}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {orderLoading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Nhấn "Đặt hàng ngay" đồng nghĩa với việc bạn đồng ý với các{' '}
                  <span className="text-blue-600">Điều khoản dịch vụ</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
