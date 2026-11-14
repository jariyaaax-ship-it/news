import { db } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { status?: string; page?: string };
}

const STATUS_MAP: Record<string, string> = {
  PENDING: 'รออนุมัติ',
  APPROVED: 'อนุมัติแล้ว',
  REJECTED: 'ปฏิเสธ',
};

export default async function ArticlesAdminPage({ searchParams }: PageProps) {
  const status = searchParams.status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined;
  const page = parseInt(searchParams.page || '1');
  const limit = 15;

  const where: any = {};
  if (status) where.status = status;

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      include: { author: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📝 จัดการบทความ</h1>
          <p className="text-gray-500 text-sm mt-1">ทั้งหมด {total} บทความ</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[undefined, 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
          <Link
            key={s || 'all'}
            href={s ? `/dashboard/articles?status=${s}` : '/dashboard/articles'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === s
                ? 'bg-blue-700 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {s ? STATUS_MAP[s] : 'ทั้งหมด'}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">บทความ</th>
              <th className="text-left px-5 py-3">ผู้เขียน</th>
              <th className="text-left px-5 py-3">หมวด</th>
              <th className="text-left px-5 py-3">สถานะ</th>
              <th className="text-left px-5 py-3">โฆษณา</th>
              <th className="text-left px-5 py-3">วันที่</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 max-w-xs">
                  <p className="font-medium text-gray-900 truncate">{article.title}</p>
                  <p className="text-gray-400 text-xs truncate">{article.excerpt}</p>
                </td>
                <td className="px-5 py-4 text-gray-600">{article.author.name}</td>
                <td className="px-5 py-4">
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {article.category}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={
                    article.status === 'PENDING' ? 'badge-pending' :
                    article.status === 'APPROVED' ? 'badge-approved' : 'badge-rejected'
                  }>
                    {STATUS_MAP[article.status]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    article.showAds
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {article.showAds ? '📢 เปิด' : '🔇 ปิด'}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(article.createdAt).toLocaleDateString('th-TH')}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/dashboard/articles/${article.id}`}
                    className="text-blue-700 hover:underline text-sm font-medium"
                  >
                    จัดการ →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {articles.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p>ไม่พบบทความ</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/dashboard/articles?${status ? `status=${status}&` : ''}page=${p}`}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${
                  page === p ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
