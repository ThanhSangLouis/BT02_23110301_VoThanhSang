import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-white mb-3">BookStore</h3>
            <p className="text-sm">Cửa hàng sách trực tuyến hàng đầu Việt Nam.</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-3">Liên kết</h3>
            <ul className="text-sm space-y-2">
              <li><Link to="/home" className="hover:text-white">Trang chủ</Link></li>
              <li><Link to="/products" className="hover:text-white">Sản phẩm</Link></li>
              <li><Link to="/news" className="hover:text-white">Tin tức</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-3">Liên hệ</h3>
            <p className="text-sm">Email: contact@bookstore.com</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-sm">
          © 2024 BookStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
