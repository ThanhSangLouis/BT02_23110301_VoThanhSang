import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { fetchMyWishlist, toggleWishlist } from '../../store/slices/wishlistSlice';
import toast from 'react-hot-toast';
import { FaHeartBroken } from 'react-icons/fa';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((s) => s.wishlist);

  useEffect(() => {
    dispatch(fetchMyWishlist());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleRemove = async (productId) => {
    try {
      const res = await dispatch(toggleWishlist(productId)).unwrap();
      if (!res.wished) toast.success('Đã bỏ yêu thích');
    } catch (e) {
      toast.error(e || 'Không thể cập nhật');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Sản phẩm yêu thích</h1>
            <p className="text-sm text-gray-500">Danh sách các sản phẩm bạn đã đánh dấu yêu thích</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="flex justify-center mb-3 text-gray-400">
              <FaHeartBroken size={36} />
            </div>
            <p className="text-gray-600 mb-4">Bạn chưa có sản phẩm yêu thích nào</p>
            <Link to="/products" className="text-blue-600 hover:underline">Khám phá sản phẩm</Link>
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

                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-bold text-blue-600">
                      {(p.salePrice ?? p.price).toLocaleString()}đ
                    </p>
                    <button
                      onClick={() => handleRemove(p._id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Bỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
