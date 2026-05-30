import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { FaShoppingCart } from 'react-icons/fa';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Layout from '../../components/Layout/Layout';
import { productAPI } from '../../api/product.api';
import { addToCart, fetchCart } from '../../store/slices/cartSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { fetchReviewsByProduct } from '../../store/slices/reviewSlice';
import { fetchWishlistStatus, toggleWishlist } from '../../store/slices/wishlistSlice';
import { trackRecentlyViewed } from '../../store/slices/recentlyViewedSlice';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { loading: cartLoading } = useSelector((state) => state.cart);

  const reviewState = useSelector((state) => state.reviews.byProduct[product?._id]);
  const reviewsLoading = useSelector((state) => state.reviews.loading);
  const wished = useSelector((state) => (product?._id ? state.wishlist.statusByProduct[product._id] : false));
  const [reviewPage, setReviewPage] = useState(1);
  const reviewLimit = 5;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProductBySlug(slug);
        if (response.data?.product) {
          setProduct(response.data.product);
          productAPI.incrementViewCount(response.data.product._id).catch(err => {
            console.log('View count error:', err);
          });
          dispatch(trackRecentlyViewed(response.data.product._id));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!product?._id) return;
    setReviewPage(1);
    if (isAuthenticated) {
      dispatch(fetchWishlistStatus(product._id));
    }
  }, [dispatch, isAuthenticated, product?._id]);

  useEffect(() => {
    if (!product?._id) return;
    dispatch(fetchReviewsByProduct({ productId: product._id, page: reviewPage, limit: reviewLimit }));
  }, [dispatch, product?._id, reviewPage]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    if (product.stockQuantity < quantity) {
      toast.error('Số lượng vượt quá tồn kho');
      return;
    }

    setAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      dispatch(fetchCart());
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      toast.error(error || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để sử dụng yêu thích');
      navigate('/login');
      return;
    }

    try {
      const res = await dispatch(toggleWishlist(product._id)).unwrap();
      toast.success(res.wished ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích');
    } catch (err) {
      toast.error(err || 'Không thể cập nhật yêu thích');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-12 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-xl mb-4">Không tìm thấy sản phẩm</h1>
          <Link to="/products" className="text-blue-600 hover:underline">← Quay lại</Link>
        </div>
      </Layout>
    );
  }

  const images = product.images?.length > 0 
    ? product.images 
    : product.coverImage 
      ? [product.coverImage] 
      : ['https://via.placeholder.com/400x600'];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link to="/home" className="text-gray-500 hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/products" className="text-gray-500 hover:text-blue-600">Sách</Link>
          {product.category && (
            <>
              <span className="mx-2 text-gray-400">/</span>
              <Link 
                to={`/products?category=${product.category.slug}`} 
                className="text-gray-500 hover:text-blue-600"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hình ảnh */}
          <div>
            <Swiper modules={[Navigation]} navigation className="mb-4">
              {images.map((img, i) => (
                <SwiperSlide key={i}>
                  <img src={img} alt={product.name} className="w-full rounded-lg" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Thông tin */}
          <div>
            {product.category && (
              <span className="inline-block bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full mb-3">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-1">Tác giả: <span className="font-medium">{product.author}</span></p>
            {product.publisher && (
              <p className="text-gray-600 mb-1">Nhà xuất bản: <span className="font-medium">{product.publisher}</span></p>
            )}
            {product.publishYear && (
              <p className="text-gray-600 mb-4">Năm: {product.publishYear}</p>
            )}

            {/* Giá */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-blue-600">
                  {product.salePrice?.toLocaleString() || product.price?.toLocaleString()}đ
                </span>
                {product.salePrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {product.price?.toLocaleString()}đ
                  </span>
                )}
              </div>
            </div>

            {/* Tồn kho */}
            <div className="text-sm text-gray-500 mb-4">
              {product.stockQuantity > 0 ? (
                <p>Còn <span className="font-medium text-green-600">{product.stockQuantity}</span> cuốn</p>
              ) : (
                <p className="text-red-500 font-medium">Hết hàng</p>
              )}
              {product.soldQuantity > 0 && (
                <p>Đã bán: <span className="font-medium">{product.soldQuantity}</span></p>
              )}
            </div>

            {/* Số lượng */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Nút */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || cartLoading || product.stockQuantity < 1}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingToCart ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    Thêm vào giỏ hàng
                  </>
                )}
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`w-full py-3 rounded-lg font-medium border flex items-center justify-center gap-2 hover:bg-gray-50 ${
                  wished ? 'border-red-500 text-red-600' : 'border-gray-300 text-gray-700'
                }`}
              >
                {wished ? <FaHeart /> : <FaRegHeart />}
                {wished ? 'Đã yêu thích' : 'Yêu thích'}
              </button>
            </div>
            {product.stockQuantity < 1 && (
              <p className="text-center text-red-500 text-sm">Sản phẩm đã hết hàng</p>
            )}
            
            <Link to="/products" className="block text-center text-blue-600 hover:underline">
              ← Quay lại danh sách sách
            </Link>
          </div>
        </div>

        {/* Mô tả */}
        {product.description && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Mô tả sản phẩm</h2>
            <div className="bg-white rounded-lg p-6 text-gray-600 whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}

        {/* Đánh giá */}
        <div className="mt-10">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold">Đánh giá</h2>
              <p className="text-sm text-gray-500">
                {Number(reviewState?.summary?.avgRating || product.rating || 0).toFixed(1)} / 5 (
                {reviewState?.summary?.reviewCount ?? product.reviewCount ?? 0} đánh giá)
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            {reviewsLoading && !reviewState ? (
              <div className="text-center text-gray-500">Đang tải đánh giá...</div>
            ) : (reviewState?.reviews?.length || 0) === 0 ? (
              <div className="text-center text-gray-500">Chưa có đánh giá nào</div>
            ) : (
              <div className="space-y-4">
                {reviewState.reviews.map((r) => (
                  <div key={r._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">{r.userId?.username || 'Ẩn danh'}</p>
                      <p className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <p className="text-sm text-yellow-600 mt-1">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                    {r.comment && (
                      <p className="text-gray-700 mt-2 whitespace-pre-line">{r.comment}</p>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                {reviewState.pagination?.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <button
                      onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                      disabled={reviewPage <= 1}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trang trước
                    </button>
                    <p className="text-sm text-gray-500">
                      Trang {reviewPage} / {reviewState.pagination.totalPages}
                    </p>
                    <button
                      onClick={() => setReviewPage((p) => Math.min(reviewState.pagination.totalPages, p + 1))}
                      disabled={reviewPage >= reviewState.pagination.totalPages}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
