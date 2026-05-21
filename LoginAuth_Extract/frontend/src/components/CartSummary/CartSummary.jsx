import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAllItems, clearCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function CartSummary() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, summary, loading } = useSelector((state) => state.cart);

  const allSelected = cart?.items?.every((item) => item.selected) || false;
  const hasItems = cart?.items?.length > 0;

  const handleSelectAll = () => {
    dispatch(selectAllItems({ selected: !allSelected }));
  };

  const handleCheckout = () => {
    if (summary.selectedQuantity === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      dispatch(clearCart());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>

      <div className="space-y-3 pb-4 border-b">
        <div className="flex justify-between text-gray-600">
          <span>Số sản phẩm</span>
          <span>{summary.selectedItems} sản phẩm</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tổng số lượng</span>
          <span>{summary.selectedQuantity} cuốn</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính</span>
          <span>{summary.subtotal.toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Phí vận chuyển</span>
          <span>{summary.shippingFee.toLocaleString()}đ</span>
        </div>
      </div>

      <div className="py-4 border-b">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Tổng cộng</span>
          <span className="text-xl font-bold text-blue-600">
            {summary.total.toLocaleString()}đ
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={handleCheckout}
          disabled={summary.selectedQuantity === 0 || loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Đang xử lý...' : 'Tiến hành đặt hàng'}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            disabled={!hasItems}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Chọn tất cả</span>
        </label>
        {hasItems && (
          <button
            onClick={handleClearCart}
            className="mt-2 text-sm text-red-500 hover:text-red-600"
          >
            Xóa giỏ hàng
          </button>
        )}
      </div>
    </div>
  );
}
