import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { newsAPI } from '../../api/news.api';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await newsAPI.getNews({ page: 1, limit: 10 });
        if (response.data) {
          setNews(response.data.news || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Tin tức</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <p className="text-gray-500">Chưa có tin tức nào.</p>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <Link key={item._id} to={`/news/${item.slug}`} className="block bg-white rounded-lg shadow-sm hover:shadow-md p-4 flex gap-4">
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-32 h-24 object-cover rounded" />
                )}
                <div>
                  <h3 className="font-bold mb-1 hover:text-blue-600">{item.title}</h3>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">{item.excerpt}</p>
                  <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
