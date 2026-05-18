import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { productAPI } from '../../api/product.api';
import { categoryAPI } from '../../api/category.api';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const search = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';

  const LIMIT = 12;

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

  // Reset products when filters change
  const resetAndFetch = useCallback(async () => {
    try {
      setLoading(true);
      setHasMore(true);
      setCursor(null);

      // If category is selected, use category-specific endpoint
      if (categorySlug) {
        const cat = categories.find(c => c.slug === categorySlug);
        if (cat) {
          const response = await productAPI.getProductsByCategory(cat._id, null, LIMIT);
          if (response.data) {
            setProducts(response.data.products || []);
            setHasMore(response.data.pagination?.hasMore || false);
            setCursor(response.data.pagination?.nextCursor);
          }
        }
      } else {
        // Use general products endpoint with page-based pagination
        const params = { page: 1, limit: LIMIT, sortBy };
        if (search) params.search = search;
        if (searchParams.get('isNew') === 'true') params.isNew = 'true';
        if (searchParams.get('isBestseller') === 'true') params.isBestseller = 'true';

        const response = await productAPI.getProducts(params);
        if (response.data) {
          setProducts(response.data.products || []);
          const totalPages = response.data.pagination?.totalPages || 1;
          setHasMore(response.data.pagination?.page < totalPages);
          setCursor(response.data.pagination?.page + 1); // For page-based
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, categories, search, sortBy, searchParams]);

  // Fetch products when filters change
  useEffect(() => {
    resetAndFetch();
  }, [searchParams.toString(), resetAndFetch]);

  // Load more products (for both category and general)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);

      if (categorySlug) {
        // Category-based cursor pagination
        const response = await productAPI.getProductsByCategory(
          categories.find(c => c.slug === categorySlug)?._id,
          cursor,
          LIMIT
        );
        if (response.data) {
          setProducts(prev => [...prev, ...(response.data.products || [])]);
          setHasMore(response.data.pagination?.hasMore || false);
          setCursor(response.data.pagination?.nextCursor);
        }
      } else {
        // Page-based pagination
        const params = { page: cursor, limit: LIMIT, sortBy };
        if (search) params.search = search;
        if (searchParams.get('isNew') === 'true') params.isNew = 'true';
        if (searchParams.get('isBestseller') === 'true') params.isBestseller = 'true';

        const response = await productAPI.getProducts(params);
        if (response.data) {
          setProducts(prev => [...prev, ...(response.data.products || [])]);
          const totalPages = response.data.pagination?.totalPages || 1;
          setHasMore(response.data.pagination?.page < totalPages);
          setCursor(response.data.pagination?.page + 1);
        }
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, cursor, categorySlug, categories, search, sortBy, searchParams]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadingMore, loadMore]);

  const handleFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const getTitle = () => {
    if (search) return `Kết quả tìm kiếm: "${search}"`;
    if (searchParams.get('isNew') === 'true') return 'Sách mới';
    if (searchParams.get('isBestseller') === 'true') return 'Sách bán chạy';
    if (categorySlug) {
      const cat = categories.find(c => c.slug === categorySlug);
      return cat ? cat.name : 'Tất cả sách';
    }
    return 'Tất cả sách';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{getTitle()}</h1>

        {/* Category Tabs - Horizontal scrollable */}
        {categories.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2 min-w-max">
              <button
                onClick={() => handleFilter('category', '')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  !categorySlug
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleFilter('category', cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    categorySlug === cat.slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
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

            {(categorySlug || search || searchParams.get('isNew') || searchParams.get('isBestseller')) && (
              <button
                onClick={() => setSearchParams({})}
                className="text-red-600 hover:underline text-sm ml-auto"
              >
                ✕ Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* Results */}
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

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {loadingMore ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải thêm...</span>
                  </div>
                ) : (
                  <button
                    onClick={loadMore}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Xem thêm sản phẩm
                  </button>
                )}
              </div>
            )}

            {!hasMore && products.length > 0 && (
              <p className="text-center text-gray-400 py-4">Đã hiển thị tất cả sản phẩm</p>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
