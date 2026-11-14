'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const CATEGORIES = ['การเมือง', 'เศรษฐกิจ', 'กีฬา', 'บันเทิง', 'เทคโนโลยี', 'สุขภาพ'];

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-blue-800 text-white text-xs py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>📰 {process.env.NEXT_PUBLIC_SITE_NAME || 'ข่าวสดออนไลน์'} — ทันทุกเหตุการณ์</span>
          <div className="flex gap-3">
            {session ? (
              <>
                <span className="text-blue-200">สวัสดี, {session.user?.name}</span>
                {session.user?.role === 'ADMIN' && (
                  <Link href="/dashboard" className="text-yellow-300 hover:text-yellow-100">
                    🛠️ แดชบอร์ด
                  </Link>
                )}
                <button onClick={() => signOut()} className="text-blue-200 hover:text-white">
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-blue-200 hover:text-white">เข้าสู่ระบบ</Link>
                <Link href="/register" className="text-yellow-300 hover:text-yellow-100">สมัครสมาชิก</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">📰</span>
          <div>
            <div className="font-bold text-xl text-blue-900 leading-tight">
              {process.env.NEXT_PUBLIC_SITE_NAME || 'ข่าวสดออนไลน์'}
            </div>
            <div className="text-xs text-gray-500">แหล่งข่าวออนไลน์ครบทุกมิติ</div>
          </div>
        </Link>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <input
            type="search"
            placeholder="ค้นหาข่าว..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="space-y-1">
            <div className="w-5 h-0.5 bg-gray-700" />
            <div className="w-5 h-0.5 bg-gray-700" />
            <div className="w-5 h-0.5 bg-gray-700" />
          </div>
        </button>
      </div>

      {/* Category nav */}
      <nav className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ul className={`${menuOpen ? 'flex flex-col py-2' : 'hidden md:flex'} gap-1`}>
            <li>
              <Link
                href="/"
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                🏠 หน้าแรก
              </Link>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat}>
                <Link
                  href={`/category/${encodeURIComponent(cat)}`}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
