import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { newsAPI } from '../../api/news.api';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await newsAPI.getBySlug(slug);
        if (response.data) {
          setArticle(response.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/news" className="text-blue-600 hover:underline mb-4 inline-block">← Quay lại</Link>
        <p className="text-gray-500 text-sm mb-2">{formatDate(article.createdAt)}</p>
        <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
        {article.image && (
          <img src={article.image} alt={article.title} className="w-full rounded-lg mb-6" />
        )}
        <div className="text-gray-600 whitespace-pre-line">{article.content?.replace(/<[^>]*>/g, '')}</div>
      </div>
    </Layout>
  );
}
