import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/Layout/Layout';
import { fetchMyPoints } from '../../store/slices/pointsSlice';
import toast from 'react-hot-toast';

export default function PointsWalletPage() {
  const dispatch = useDispatch();
  const { pointsBalance, ledger, loading, error } = useSelector((s) => s.points);

  const [page] = useState(1);

  useEffect(() => {
    dispatch(fetchMyPoints({ page, limit: 20 }));
  }, [dispatch, page]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Điểm tích lũy</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-sm text-gray-500">Số điểm hiện có</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {Number(pointsBalance || 0).toLocaleString()} điểm
          </p>
          <p className="text-xs text-gray-500 mt-2">1 điểm = 1 VNĐ khi thanh toán</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Lịch sử điểm</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Đang tải...</div>
          ) : ledger.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Chưa có giao dịch điểm</div>
          ) : (
            <div className="divide-y">
              {ledger.map((row) => (
                <div key={row._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{row.type}</p>
                    <p className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className={`font-bold ${row.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {row.points >= 0 ? '+' : ''}{Number(row.points).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
