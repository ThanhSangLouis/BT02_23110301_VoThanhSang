import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.slug}`} className="bg-white rounded-lg shadow-sm hover:shadow-md p-4 block">
      <div className="aspect-[3/4] bg-gray-100 rounded mb-3 overflow-hidden">
        <img
          src={product.coverImage || 'https://via.placeholder.com/200'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
      <p className="text-gray-500 text-xs mb-2">{product.author}</p>
      <p className="font-bold text-blue-600">
        {product.salePrice?.toLocaleString() || product.price?.toLocaleString()}đ
      </p>
    </Link>
  );
}
