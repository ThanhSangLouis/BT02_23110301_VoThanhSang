import { useEffect, useState, useCallback } from 'react';
import { productAPI } from '../../api/product.api';
import HorizontalCarousel from '../ProductCard/HorizontalCarousel';

export default function TopProductsSection() {
  const [topSelling, setTopSelling] = useState([]);
  const [topViewed, setTopViewed] = useState([]);
  const [sellingPage, setSellingPage] = useState(1);
  const [viewedPage, setViewedPage] = useState(1);
  const [sellingTotal, setSellingTotal] = useState(0);
  const [viewedTotal, setViewedTotal] = useState(0);
  const [loadingSelling, setLoadingSelling] = useState(true);
  const [loadingViewed, setLoadingViewed] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const ITEMS_PER_PAGE = 5;

  const fetchTopSelling = useCallback(async (page) => {
    try {
      if (page === 1) setLoadingSelling(true);
      const response = await productAPI.getTopSellingProducts(page, ITEMS_PER_PAGE);
      if (response.data) {
        if (page === 1) {
          setTopSelling(response.data.products || []);
        } else {
          setTopSelling(prev => [...prev, ...(response.data.products || [])]);
        }
        setSellingTotal(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching top selling:', error);
    } finally {
      setLoadingSelling(false);
    }
  }, []);

  const fetchTopViewed = useCallback(async (page) => {
    try {
      if (page === 1) setLoadingViewed(true);
      const response = await productAPI.getTopViewedProducts(page, ITEMS_PER_PAGE);
      if (response.data) {
        if (page === 1) {
          setTopViewed(response.data.products || []);
        } else {
          setTopViewed(prev => [...prev, ...(response.data.products || [])]);
        }
        setViewedTotal(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching top viewed:', error);
    } finally {
      setLoadingViewed(false);
    }
  }, []);

  useEffect(() => {
    if (initialLoad) {
      fetchTopSelling(1);
      fetchTopViewed(1);
      setInitialLoad(false);
    }
  }, [initialLoad, fetchTopSelling, fetchTopViewed]);

  const handleSellingPageChange = (newPage) => {
    setSellingPage(newPage);
    fetchTopSelling(newPage);
  };

  const handleViewedPageChange = (newPage) => {
    setViewedPage(newPage);
    fetchTopViewed(newPage);
  };

  const totalSellingPages = Math.ceil(sellingTotal / ITEMS_PER_PAGE);
  const totalViewedPages = Math.ceil(viewedTotal / ITEMS_PER_PAGE);

  return (
    <div>
      {/* Top Selling Products */}
      <HorizontalCarousel
        products={topSelling}
        title="Top 10 Sách Bán Chạy"
        icon="🔥"
        loading={loadingSelling && initialLoad}
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={sellingTotal}
        currentPage={sellingPage}
        onPageChange={handleSellingPageChange}
        linkTo="/products?sort=soldQuantity"
        linkText="Xem tất cả"
      />

      {/* Top Viewed Products */}
      <HorizontalCarousel
        products={topViewed}
        title="Top 10 Sách Xem Nhiều Nhất"
        icon="👁"
        loading={loadingViewed && initialLoad}
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={viewedTotal}
        currentPage={viewedPage}
        onPageChange={handleViewedPageChange}
        linkTo="/products"
        linkText="Khám phá thêm"
      />
    </div>
  );
}
