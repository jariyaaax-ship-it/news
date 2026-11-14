import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArticleActions } from './ArticleActions';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: '⏳ รออนุมัติ', className: 'badge-pending' },
  APPROVED: { label: '✅ อนุมัติแล้ว', className: 'badge-approved' },
  REJECTED: { label: '❌ ปฏิเสธ', className: 'badge-rejected' },
};

export default async function ArticleDetailPage({ params }: PageProps) {
  const article = await db.article.findUnique({
    where: { id: params.id },
    include: { author: { select: { name: true, email: true } } },
  });

  if (!article) notFound();

  const statusInfo = STATUS_MAP[article.status];

  return (
    <div>
      {/* Back */}
      <Link href="/dashboard/articles" className="text-sm text-gray-500 hover:text-blue-700 mb-4 inline-flex items-center gap-1">
        ← กลับรายการบทความ
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Article Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{article.title}</h1>
              <span className={statusInfo.className}>{statusInfo.label}</span>
            </div>

            <div className="flex gap-4 text-sm text-gray-500 mb-5 pb-4 border-b border-gray-100">
              <span>✍️ {article.author.name}</span>
              <span>📧 {article.author.email}</span>
              <span>📂 {article.category}</span>
              <span>📅 {new Date(article.createdAt).toLocaleDateString('th-TH')}</span>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">บทสรุป</p>
              <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3">{article.excerpt}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">เนื้อหาบทความ</p>
              <div
                className="article-content text-gray-800 bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto text-sm"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <ArticleActions article={article as any} />

          {/* Meta info */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">ℹ️ ข้อมูลบทความ</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">ID</dt>
                <dd className="text-gray-700 font-mono text-xs">{article.id.slice(0, 12)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">สร้างเมื่อ</dt>
                <dd className="text-gray-700">{new Date(article.createdAt).toLocaleDateString('th-TH')}</dd>
              </div>
              {article.publishedAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">เผยแพร่เมื่อ</dt>
                  <dd className="text-gray-700">{new Date(article.publishedAt).toLocaleDateString('th-TH')}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">โฆษณา</dt>
                <dd className={article.showAds ? 'text-green-600' : 'text-gray-400'}>
                  {article.showAds ? '📢 เปิด' : '🔇 ปิด'}
                </dd>
              </div>
            </dl>

            {article.status === 'APPROVED' && (
              <Link
                href={`/news/${article.slug}`}
                target="_blank"
                className="mt-4 w-full btn-secondary text-sm text-center block"
              >
                🌐 ดูหน้าบทความ ↗
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
