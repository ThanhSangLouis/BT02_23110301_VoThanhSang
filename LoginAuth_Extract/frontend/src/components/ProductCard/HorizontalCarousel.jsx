import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HorizontalCarousel({
  products = [],
  title,
  icon,
  loading = false,
  itemsPerPage = 5,
  totalItems = 0,
  currentPage = 1,
  onPageChange,
  linkTo = null,
  linkText = 'Xem thêm'
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - e.currentTarget.offsetLeft);
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX) * 2;
    e.currentTarget.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{icon} {title}</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48 h-72 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{icon} {title}</h2>
        {linkTo && (
          <Link to={linkTo} className="text-blue-600 hover:underline">
            {linkText} →
          </Link>
        )}
      </div>

      <div className="relative">
        <div
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {products.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p.slug}`}
              className="flex-shrink-0 w-48 bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden block transition-all hover:scale-105"
            >
              <div className="aspect-[3/4] bg-gray-100">
                <img
                  src={p.coverImage || 'https://via.placeholder.com/200x300'}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                {p.category && (
                  <p className="text-xs text-blue-600 mb-1 truncate">{p.category.name}</p>
                )}
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{p.name}</h3>
                <p className="text-gray-500 text-xs mb-2 truncate">{p.author}</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-blue-600 text-sm">
                    {p.salePrice?.toLocaleString() || p.price?.toLocaleString()}đ
                  </p>
                  {p.salePrice && (
                    <p className="text-gray-400 text-xs line-through">
                      {p.price?.toLocaleString()}đ
                    </p>
                  )}
                </div>
                {p.soldQuantity > 0 && (
                  <p className="text-xs text-gray-400 mt-1">Đã bán: {p.soldQuantity}</p>
                )}
                {p.viewCount > 0 && (
                  <p className="text-xs text-gray-400 mt-1">Lượt xem: {p.viewCount}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange && onPageChange(pageNum)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentPage === pageNum
                    ? 'bg-blue-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Trang ${pageNum}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
