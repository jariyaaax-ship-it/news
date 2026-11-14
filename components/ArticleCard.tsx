import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
  category: string;
  publishedAt?: string | null;
  createdAt: string;
  author: { name: string };
}

interface ArticleCardProps {
  article: Article;
  size?: 'large' | 'medium' | 'small';
}

const CATEGORY_COLORS: Record<string, string> = {
  'การเมือง': 'bg-red-100 text-red-800',
  'เศรษฐกิจ': 'bg-green-100 text-green-800',
  'กีฬา': 'bg-blue-100 text-blue-800',
  'บันเทิง': 'bg-purple-100 text-purple-800',
  'เทคโนโลยี': 'bg-cyan-100 text-cyan-800',
  'สุขภาพ': 'bg-orange-100 text-orange-800',
};

export function ArticleCard({ article, size = 'medium' }: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(
    new Date(article.publishedAt || article.createdAt),
    { addSuffix: true, locale: th }
  );

  const categoryColor = CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-800';

  if (size === 'large') {
    return (
      <Link href={`/news/${article.slug}`} className="group block card hover:shadow-md transition-shadow">
        <div className="relative h-72 bg-gray-200">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">📰</div>
          )}
          <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-medium ${categoryColor}`}>
            {article.category}
          </span>
        </div>
        <div className="p-5">
          <h2 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
            {article.title}
          </h2>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{article.excerpt}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>✍️ {article.author.name}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (size === 'small') {
    return (
      <Link href={`/news/${article.slug}`} className="group flex gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
        {article.coverImage && (
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
            <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${categoryColor}`}>{article.category}</span>
          <p className="font-medium text-sm text-gray-900 group-hover:text-blue-700 mt-0.5 line-clamp-2">
            {article.title}
          </p>
          <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
        </div>
      </Link>
    );
  }

  // medium (default)
  return (
    <Link href={`/news/${article.slug}`} className="group block card hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-200">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📰</div>
        )}
        <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor}`}>
          {article.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-2">{article.excerpt}</p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>✍️ {article.author.name}</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </Link>
  );
}
