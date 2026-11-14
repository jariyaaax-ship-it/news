import { db } from '@/lib/db';
import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await db.article.findMany({
    where: { status: 'APPROVED' },
    select: { slug: true, updatedAt: true, category: true },
  });

  const categorySet = new Set(articles.map((a) => a.category));
  const categories = Array.from(categorySet);

  const articleRoutes = articles.map((article) => ({
    url: `${siteUrl}/news/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryRoutes = categories.map((cat) => ({
    url: `${siteUrl}/category/${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    ...categoryRoutes,
    ...articleRoutes,
  ];
}
