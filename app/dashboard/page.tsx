import { db } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [pending, approved, rejected, totalUsers, recentArticles] = await Promise.all([
    db.article.count({ where: { status: 'PENDING' } }),
    db.article.count({ where: { status: 'APPROVED' } }),
    db.article.count({ where: { status: 'REJECTED' } }),
    db.user.count(),
    db.article.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    }),
  ]);

  const stats = [
    { label: 'รออนุมัติ', value: pending, color: 'bg-yellow-500', icon: '⏳', href: '/dashboard/articles?status=PENDING' },
    { label: 'อนุมัติแล้ว', value: approved, color: 'bg-green-500', icon: '✅', href: '/dashboard/articles?status=APPROVED' },
    { label: 'ปฏิเสธ', value: rejected, color: 'bg-red-500', icon: '❌', href: '/dashboard/articles?status=REJECTED' },
    { label: 'ผู้ใช้ทั้งหมด', value: totalUsers, color: 'bg-blue-500', icon: '👥', href: '#' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 ภาพรวม</h1>
        <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับสู่ Admin Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white w-10 h-10 rounded-lg flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent articles */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-800">📝 บทความล่าสุด</h2>
          <Link href="/dashboard/articles" className="text-sm text-blue-700 hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentArticles.map((article) => (
            <div key={article.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{article.title}</p>
                <p className="text-sm text-gray-400">โดย {article.author.name} · {article.category}</p>
              </div>
              <span className={
                article.status === 'PENDING' ? 'badge-pending' :
                article.status === 'APPROVED' ? 'badge-approved' : 'badge-rejected'
              }>
                {article.status === 'PENDING' ? 'รออนุมัติ' :
                 article.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
              </span>
              <Link
                href={`/dashboard/articles/${article.id}`}
                className="text-sm text-blue-700 hover:underline whitespace-nowrap"
              >
                จัดการ →
              </Link>
            </div>
          ))}
          {recentArticles.length === 0 && (
            <div className="p-8 text-center text-gray-400">ยังไม่มีบทความ</div>
          )}
        </div>
      </div>

      {/* AdSense Quick Status */}
      <div className="card mt-6 p-5">
        <h2 className="font-bold text-gray-800 mb-3">📢 สถานะ Google AdSense</h2>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.includes('XXXX') ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium text-sm">⏳ ยังไม่ได้ตั้งค่า AdSense</p>
            <p className="text-yellow-700 text-xs mt-1">
              สมัคร Google AdSense → รับ Publisher ID → ใส่ใน .env.local ที่ NEXT_PUBLIC_ADSENSE_CLIENT_ID
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium text-sm">✅ AdSense พร้อมใช้งาน</p>
            <p className="text-green-700 text-xs mt-1">Client ID: {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}</p>
          </div>
        )}
      </div>
    </div>
  );
}
