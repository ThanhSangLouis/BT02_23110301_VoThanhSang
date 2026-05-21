import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminAPI from '../../api/admin.api';
import toast from 'react-hot-toast';
import { FiSearch, FiFilter, FiEye, FiCheck, FiX } from 'react-icons/fi';

const statusLabels = {
  new: { label: 'Mới', color: 'bg-blue-100 text-blue-700' },
  preparing: { label: 'Đang chuẩn bị', color: 'bg-yellow-100 text-yellow-700' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

const nextStatus = {
  new: 'preparing',
  preparing: 'shipping',
  shipping: 'delivered',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filter.status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.search) params.search = filter.search;
      const data = await adminAPI.getOrders(params);
      const ordersData = data?.data?.orders || data?.orders || data?.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      fetchOrders();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
        <p className="text-gray-500">Danh sách và trạng thái đơn hàng</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm mã đơn, tên khách..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </form>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiFilter size={18} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có đơn hàng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Mã đơn</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Khách hàng</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Số sản phẩm</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tổng tiền</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Trạng thái</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ngày đặt</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{order.orderNumber}</td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <p className="font-medium">{order.userId?.username || 'N/A'}</p>
                        <p className="text-gray-500 text-xs">{order.userId?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{order.items?.length || 0}</td>
                    <td className="py-3 px-4 text-sm font-medium">{order.totalAmount?.toLocaleString()}đ</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[order.orderStatus]?.color}`}>
                        {statusLabels[order.orderStatus]?.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewOrder(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Xem chi tiết"
                        >
                          <FiEye size={18} />
                        </button>
                        {nextStatus[order.orderStatus] && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, nextStatus[order.orderStatus])}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Cập nhật trạng thái"
                          >
                            <FiCheck size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mã đơn hàng</p>
                  <p className="font-mono font-medium">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[selectedOrder.orderStatus]?.color}`}>
                    {statusLabels[selectedOrder.orderStatus]?.label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khách hàng</p>
                  <p className="font-medium">{selectedOrder.userId?.username}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.userId?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày đặt</p>
                  <p>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Địa chỉ giao hàng</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium">{selectedOrder.shippingInfo?.fullName}</p>
                  <p className="text-sm">{selectedOrder.shippingInfo?.phone}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.shippingInfo?.address}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Sản phẩm</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                      <img
                        src={item.coverImage || 'https://via.placeholder.com/50'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.author}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.subtotal?.toLocaleString()}đ</p>
                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{selectedOrder.subtotal?.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>{selectedOrder.shippingFee?.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">{selectedOrder.totalAmount?.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
              {nextStatus[selectedOrder.orderStatus] && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedOrder._id, nextStatus[selectedOrder.orderStatus]);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Cập nhật: {statusLabels[nextStatus[selectedOrder.orderStatus]]?.label}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
