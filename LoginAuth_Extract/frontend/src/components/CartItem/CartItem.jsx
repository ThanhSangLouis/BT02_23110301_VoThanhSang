import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import {
  updateCartItem,
  removeFromCart,
  toggleSelectItem,
} from '../../store/slices/cartSlice';

export default function CartItem({ item }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.cart);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateCartItem({ productId: item.productId, quantity: newQuantity }));
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item.productId));
  };

  const handleToggleSelect = () => {
    dispatch(toggleSelectItem({ productId: item.productId, selected: !item.selected }));
  };

  const handleProductClick = () => {
    navigate(`/product/${item.productId}`);
  };

  const subtotal = item.price * item.quantity;

  return (
    <div className={`flex gap-4 p-4 bg-white rounded-lg shadow-sm ${!item.selected ? 'opacity-60' : ''}`}>
      <div className="flex-shrink-0">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={handleToggleSelect}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      <div
        className="w-20 h-24 flex-shrink-0 cursor-pointer"
        onClick={handleProductClick}
      >
        <img
          src={item.coverImage || 'https://via.placeholder.com/80x96'}
          alt={item.name}
          className="w-full h-full object-cover rounded"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className="font-medium text-gray-800 hover:text-blue-600 cursor-pointer line-clamp-2"
          onClick={handleProductClick}
        >
          {item.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{item.author}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-blue-600">
            {item.price.toLocaleString()}đ
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          onClick={handleRemove}
          disabled={loading}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <FaTrash />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1 || loading}
            className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <FaMinus size={12} />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <FaPlus size={12} />
          </button>
        </div>

        <div className="text-right">
          <p className="font-semibold text-gray-800">
            {subtotal.toLocaleString()}đ
          </p>
        </div>
      </div>
    </div>
  );
}
