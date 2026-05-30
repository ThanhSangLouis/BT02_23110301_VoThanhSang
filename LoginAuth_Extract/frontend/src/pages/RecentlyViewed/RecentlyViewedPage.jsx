import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { fetchMyRecentlyViewed } from '../../store/slices/recentlyViewedSlice';
import toast from 'react-hot-toast';

export default function RecentlyViewedPage() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((s) => s.recentlyViewed);

  useEffect(() => {
    dispatch(fetchMyRecentlyViewed({ limit: 24 }));
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sản phẩm đã xem</h1>
          <p className="text-sm text-gray-500">Những sản phẩm bạn đã xem gần đây</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-600">
            Bạn chưa xem sản phẩm nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Link to={`/product/${p.slug}`}>
                  <img
                    src={p.coverImage || p.images?.[0] || 'https://via.placeholder.com/300x420'}
                    alt={p.name}
                    className="w-full h-56 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/product/${p.slug}`} className="font-semibold text-gray-800 hover:text-blue-600 line-clamp-2">
                    {p.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{p.author}</p>
                  <p className="mt-3 font-bold text-blue-600">
                    {(p.salePrice ?? p.price).toLocaleString()}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
