import { Link } from 'react-router-dom';
import { FaBox, FaChevronRight } from 'react-icons/fa';

const ORDER_STATUS_CONFIG = {
  new: { label: 'Đơn hàng mới', color: 'bg-blue-100 text-blue-700', icon: '📦' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: '✅' },
  preparing: { label: 'Đang chuẩn bị', color: 'bg-yellow-100 text-yellow-700', icon: '📋' },
  shipping: { label: 'Đang giao hàng', color: 'bg-orange-100 text-orange-700', icon: '🚚' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700', icon: '🎉' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: '❌' },
};

export default function OrderCard({ order }) {
  const statusConfig = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.new;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Link
      to={`/orders/${order._id}`}
      className="block bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500">Mã đơn hàng</p>
          <p className="font-semibold text-gray-800">{order.orderNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <FaBox className="text-gray-400" />
        <span className="text-sm text-gray-600">
          {itemCount} sản phẩm
        </span>
      </div>

      <div className="text-xs text-gray-500 mb-3">
        {formatDate(order.createdAt)}
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <span className="text-lg font-bold text-blue-600">
          {order.totalAmount.toLocaleString()}đ
        </span>
        <div className="flex items-center gap-1 text-sm text-blue-600">
          <span>Xem chi tiết</span>
          <FaChevronRight size={14} />
        </div>
      </div>
    </Link>
  );
}
