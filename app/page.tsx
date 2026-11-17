import { db } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArticleCard } from '@/components/ArticleCard';
import { GoogleAd } from '@/components/GoogleAd';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const articles = await db.article.findMany({
    where: { status: 'APPROVED' },
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });

  const featured = articles[0];
  const latest = articles.slice(1, 7);
  const more = articles.slice(7);

  return (
    <>
      <Navbar />
      <GoogleAd />
      <main className="max-w-7xl mx-auto px-4 py-6">

        {articles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl font-medium">ยังไม่มีบทความที่เผยแพร่</p>
            <p className="mt-2 text-sm">กลับมาใหม่เร็ว ๆ นี้</p>
          </div>
        ) : (
          <>
            {/* Featured + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {featured && (
                <div className="lg:col-span-2">
                  <h2 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">
                    🔥 ข่าวเด่น
                  </h2>
                  <ArticleCard article={featured as any} size="large" />
                </div>
              )}

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="card p-4">
                  <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                    ⚡ ข่าวล่าสุด
                  </h3>
                  {latest.slice(0, 5).map((article) => (
                    <ArticleCard key={article.id} article={article as any} size="small" />
                  ))}
                </div>

              </div>
            </div>

            {/* Latest Grid */}
            {latest.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-1 h-6 bg-blue-700 rounded-full" />
                  <h2 className="font-bold text-lg text-gray-800">ข่าวล่าสุด</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {latest.map((article) => (
                    <ArticleCard key={article.id} article={article as any} />
                  ))}
                </div>
              </section>
            )}

            {/* More News */}
            {more.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-1 h-6 bg-gray-400 rounded-full" />
                  <h2 className="font-bold text-lg text-gray-800">ข่าวเพิ่มเติม</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {more.map((article) => (
                    <ArticleCard key={article.id} article={article as any} size="medium" />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
