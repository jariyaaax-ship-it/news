import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdUnit } from '@/components/AdUnit';
import { ArticleCard } from '@/components/ArticleCard';
import type { Metadata } from 'next';
import Image from 'next/image';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true } } },
  });

  if (!article) return { title: 'ไม่พบบทความ' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${siteUrl}/news/${article.slug}`,
      images: article.coverImage ? [{ url: article.coverImage }] : [],
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.name],
    },
    authors: [{ name: article.author.name }],
  };
}

export const dynamic = 'force-dynamic';

export default async function ArticlePage({ params }: PageProps) {
  const article = await db.article.findUnique({
    where: { slug: params.slug, status: 'APPROVED' },
    include: { author: { select: { name: true } } },
  });

  if (!article) notFound();

  // Related articles
  const related = await db.article.findMany({
    where: { status: 'APPROVED', category: article.category, NOT: { id: article.id } },
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: 'desc' },
    take: 4,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage || undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { '@type': 'Person', name: article.author.name },
    publisher: {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME || 'ข่าวสดออนไลน์',
      url: siteUrl,
    },
    url: `${siteUrl}/news/${article.slug}`,
    articleSection: article.category,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article content */}
          <article className="lg:col-span-2">
            {/* Category & breadcrumb */}
            <div className="text-sm text-gray-500 mb-3">
              <a href="/" className="hover:text-blue-700">หน้าแรก</a>
              <span className="mx-2">›</span>
              <a href={`/category/${article.category}`} className="hover:text-blue-700">{article.category}</a>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
              <span>✍️ {article.author.name}</span>
              <span>•</span>
              <span>
                {format(new Date(article.publishedAt || article.createdAt), 'dd MMMM yyyy', { locale: th })}
              </span>
              <span className="ml-auto px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                {article.category}
              </span>
            </div>

            {/* Cover Image */}
            {article.coverImage && (
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-6">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Top Ad (shown only if admin enabled ads) */}
            {article.showAds && (
              <div className="mb-6">
                <AdUnit slot="2233445566" format="horizontal" className="w-full" style={{ minHeight: 90 }} />
              </div>
            )}

            {/* Article Body */}
            <div
              className="article-content text-gray-800 leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Bottom Ad (shown only if admin enabled ads) */}
            {article.showAds && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2 text-center">— โฆษณา —</p>
                <AdUnit slot="6655443322" format="rectangle" className="w-full" style={{ minHeight: 250 }} />
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Sticky sidebar ad */}
            <div className="sticky top-20">
              <AdUnit slot="9988776655" format="rectangle" style={{ minHeight: 250 }} />

              {/* Related articles */}
              {related.length > 0 && (
                <div className="card p-4 mt-4">
                  <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                    📌 บทความที่เกี่ยวข้อง
                  </h3>
                  {related.map((r) => (
                    <ArticleCard key={r.id} article={r as any} size="small" />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
