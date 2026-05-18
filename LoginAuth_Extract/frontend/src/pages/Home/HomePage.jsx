import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import Layout from '../../components/Layout/Layout';
import { productAPI } from '../../api/product.api';
import { promotionAPI } from '../../api/promotion.api';
import TopProductsSection from '../../components/ProductCard/TopProductsSection';

export default function HomePage() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [newProducts, setNewProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [newData, bestData, promoData] = await Promise.all([
          productAPI.getNewProducts(8),
          productAPI.getBestsellers(8),
          promotionAPI.getFeatured(5),
        ]);
        setNewProducts(newData.data || []);
        setBestsellers(bestData.data || []);
        setPromotions(promoData.data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      {/* Banner khuyến mãi */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <Swiper 
          modules={[Navigation, Autoplay]} 
          navigation 
          autoplay={{ delay: 4000, disableOnInteraction: false }} 
          loop 
          className="max-w-5xl mx-auto py-10"
        >
          {promotions.length > 0 ? promotions.map((promo) => (
            <SwiperSlide key={promo._id}>
              <div className="text-center px-8">
                <span className="inline-block bg-red-500 text-white text-sm px-3 py-1 rounded-full mb-3">
                  Giảm {promo.discountPercent}%
                </span>
                <h1 className="text-2xl md:text-4xl font-bold mb-3">{promo.title}</h1>
                <p className="text-blue-100 mb-4 max-w-xl mx-auto">{promo.description}</p>
                <button 
                  onClick={() => navigate('/products')} 
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Xem ngay
                </button>
              </div>
            </SwiperSlide>
          )) : (
            <SwiperSlide>
              <div className="text-center px-8">
                <h1 className="text-2xl md:text-4xl font-bold mb-3">Chào mừng đến BookStore</h1>
                <p className="text-blue-100 mb-4">Khám phá hàng ngàn cuốn sách hay</p>
                <button 
                  onClick={() => navigate('/products')} 
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50"
                >
                  Khám phá ngay
                </button>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Thông tin thành viên */}
        {isAuthenticated && (
          <div className="bg-blue-50 rounded-lg p-4 mb-8 flex items-center justify-between">
            <div>
              <p className="text-gray-600">Xin chào,</p>
              <p className="font-bold text-lg text-blue-600">{user?.username}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Email: {user?.email}</p>
            </div>
          </div>
        )}

        {/* Sách mới */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">📖 Sách mới nhất</h2>
            <Link to="/products?isNew=true" className="text-blue-600 hover:underline">Xem thêm →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : newProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newProducts.slice(0, 4).map((p) => (
                <Link 
                  key={p._id} 
                  to={`/product/${p.slug}`} 
                  className="bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden block transition"
                >
                  <div className="aspect-[3/4] bg-gray-100">
                    <img 
                      src={p.coverImage || 'https://via.placeholder.com/300x400'} 
                      alt={p.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-3">
                    {p.category && (
                      <p className="text-xs text-blue-600 mb-1">{p.category.name}</p>
                    )}
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{p.name}</h3>
                    <p className="text-gray-500 text-xs mb-2">{p.author}</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-blue-600">{p.price?.toLocaleString()}đ</p>
                      {p.salePrice && (
                        <p className="text-gray-400 text-xs line-through">{p.salePrice?.toLocaleString()}đ</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có sách mới</p>
          )}
        </div>

        {/* Sách bán chạy */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">🔥 Sách bán chạy</h2>
            <Link to="/products?isBestseller=true" className="text-blue-600 hover:underline">Xem thêm →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : bestsellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bestsellers.slice(0, 4).map((p) => (
                <Link 
                  key={p._id} 
                  to={`/product/${p.slug}`} 
                  className="bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden block transition"
                >
                  <div className="aspect-[3/4] bg-gray-100">
                    <img 
                      src={p.coverImage || 'https://via.placeholder.com/300x400'} 
                      alt={p.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-3">
                    {p.category && (
                      <p className="text-xs text-blue-600 mb-1">{p.category.name}</p>
                    )}
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{p.name}</h3>
                    <p className="text-gray-500 text-xs mb-2">{p.author}</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-blue-600">{p.price?.toLocaleString()}đ</p>
                      {p.salePrice && (
                        <p className="text-gray-400 text-xs line-through">{p.salePrice?.toLocaleString()}đ</p>
                      )}
                    </div>
                    {p.soldQuantity > 0 && (
                      <p className="text-xs text-gray-400 mt-1">Đã bán: {p.soldQuantity}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có sách bán chạy</p>
          )}
        </div>

        {/* Top Products Section - Sách bán chạy & Xem nhiều nhất */}
        <TopProductsSection />

        {/* Nút xem tất cả */}
        <div className="text-center">
          <button 
            onClick={() => navigate('/products')} 
            className="bg-blue-600 text-white px-10 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Xem tất cả sách →
          </button>
        </div>
      </div>
    </Layout>
  );
}
