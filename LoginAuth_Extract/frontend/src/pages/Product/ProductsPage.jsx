import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { productAPI } from '../../api/product.api';
import { categoryAPI } from '../../api/category.api';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when params change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 12, sortBy };
        
        if (search) params.search = search;
        if (category) params.category = category;
        if (searchParams.get('isNew') === 'true') params.isNew = 'true';
        if (searchParams.get('isBestseller') === 'true') params.isBestseller = 'true';

        const response = await productAPI.getProducts(params);
        
        if (response.data) {
          setProducts(response.data.products || []);
          setTotalPages(response.data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams.toString(), page]);

  const handleFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page');
    setSearchParams(newParams);
    setPage(1);
  };

  const getTitle = () => {
    if (search) return `Kết quả tìm kiếm: "${search}"`;
    if (searchParams.get('isNew') === 'true') return 'Sách mới';
    if (searchParams.get('isBestseller') === 'true') return 'Sách bán chạy';
    if (category) {
      const cat = categories.find(c => c.slug === category);
      return cat ? cat.name : 'Tất cả sách';
    }
    return 'Tất cả sách';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{getTitle()}</h1>

        {/* Bộ lọc */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Danh mục:</label>
              <select
                value={category}
                onChange={(e) => handleFilter('category', e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Tất cả</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sắp xếp:</label>
              <select
                value={sortBy}
                onChange={(e) => handleFilter('sortBy', e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="createdAt">Mới nhất</option>
                <option value="price">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
                <option value="soldQuantity">Bán chạy</option>
              </select>
            </div>

            {(category || search || searchParams.get('isNew') || searchParams.get('isBestseller')) && (
              <button
                onClick={() => setSearchParams({})}
                className="text-red-600 hover:underline text-sm ml-auto"
              >
                ✕ Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* Kết quả */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm nào</p>
            <button 
              onClick={() => setSearchParams({})} 
              className="text-blue-600 hover:underline"
            >
              Xem tất cả sách
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">{products.length} sản phẩm</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((p) => (
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
                      <p className="font-bold text-blue-600">
                        {p.salePrice?.toLocaleString() || p.price?.toLocaleString()}đ
                      </p>
                      {p.salePrice && (
                        <p className="text-gray-400 text-xs line-through">
                          {p.price?.toLocaleString()}đ
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  ← Trước
                </button>
                <span className="px-4 py-2">
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
