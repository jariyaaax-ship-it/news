import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArticleCard } from '@/components/ArticleCard';
import type { Metadata } from 'next';

interface PageProps {
  params: { name: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = decodeURIComponent(params.name);
  return {
    title: `ข่าว${category}`,
    description: `รวมข่าว${category}ล่าสุด อัปเดตทุกวัน`,
  };
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: PageProps) {
  const category = decodeURIComponent(params.name);

  const articles = await db.article.findMany({
    where: { status: 'APPROVED', category },
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });

  if (articles.length === 0) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-xl font-medium">ไม่พบข่าวในหมวด &ldquo;{category}&rdquo;</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1.5 h-8 bg-blue-700 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-900">ข่าว{category}</h1>
          <span className="text-sm text-gray-400">({articles.length} บทความ)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article as any} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
