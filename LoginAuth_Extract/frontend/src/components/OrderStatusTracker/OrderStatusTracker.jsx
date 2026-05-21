import { FaCheck, FaTimes, FaClock, FaBox, FaTruck, FaSmile } from 'react-icons/fa';

const STATUS_STEPS = [
  { key: 'new', label: 'Đơn hàng mới', icon: FaBox, color: 'blue' },
  { key: 'confirmed', label: 'Đã xác nhận', icon: FaCheck, color: 'blue' },
  { key: 'preparing', label: 'Đang chuẩn bị', icon: FaClock, color: 'yellow' },
  { key: 'shipping', label: 'Đang giao', icon: FaTruck, color: 'orange' },
  { key: 'delivered', label: 'Đã giao', icon: FaSmile, color: 'green' },
];

const CANCELLED_STEP = { key: 'cancelled', label: 'Đã hủy', icon: FaTimes, color: 'red' };

export default function OrderStatusTracker({ status, statusHistory = [] }) {
  const isCancelled = status === 'cancelled';

  const getCurrentStepIndex = () => {
    if (isCancelled) return -1;
    const index = STATUS_STEPS.findIndex((step) => step.key === status);
    return index;
  };

  const currentStepIndex = getCurrentStepIndex();

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusChangeTime = (statusKey) => {
    const historyItem = statusHistory.find((h) => h.status === statusKey);
    return historyItem?.changedAt;
  };

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <FaTimes className="text-red-600 text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-red-700">Đơn hàng đã bị hủy</h3>
            <p className="text-sm text-red-600">
              {getStatusChangeTime('cancelled') && (
                <>Vào lúc {formatDateTime(getStatusChangeTime('cancelled'))}</>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="font-semibold text-gray-800 mb-6">Tình trạng đơn hàng</h3>

      <div className="relative">
        {STATUS_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;
          const changeTime = getStatusChangeTime(step.key);

          const colorClasses = {
            blue: {
              completed: 'bg-blue-600 text-white',
              current: 'bg-blue-600 text-white ring-4 ring-blue-100',
              pending: 'bg-gray-200 text-gray-400',
            },
            yellow: {
              completed: 'bg-yellow-500 text-white',
              current: 'bg-yellow-500 text-white ring-4 ring-yellow-100',
              pending: 'bg-gray-200 text-gray-400',
            },
            orange: {
              completed: 'bg-orange-500 text-white',
              current: 'bg-orange-500 text-white ring-4 ring-orange-100',
              pending: 'bg-gray-200 text-gray-400',
            },
            green: {
              completed: 'bg-green-600 text-white',
              current: 'bg-green-600 text-white ring-4 ring-green-100',
              pending: 'bg-gray-200 text-gray-400',
            },
          };

          const colorClass = isCompleted || isCurrent
            ? colorClasses[step.color][isCurrent ? 'current' : 'completed']
            : colorClasses[step.color].pending;

          return (
            <div key={step.key} className="relative flex items-start mb-8 last:mb-0">
              <div className="flex flex-col items-center mr-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                  <Icon size={18} />
                </div>
                {index < STATUS_STEPS.length - 1 && (
                  <div
                    className={`w-0.5 h-8 mt-2 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              <div className="flex-1 pb-2">
                <p className={`font-medium ${isPending ? 'text-gray-400' : 'text-gray-800'}`}>
                  {step.label}
                </p>
                {changeTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(changeTime)}
                  </p>
                )}
                {isCurrent && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                    Hiện tại
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
