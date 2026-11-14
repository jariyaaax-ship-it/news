'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const NAV_ITEMS = [
  { href: '/dashboard', label: '📊 ภาพรวม', exact: true },
  { href: '/dashboard/articles', label: '📝 บทความทั้งหมด' },
  { href: '/dashboard/articles?status=PENDING', label: '⏳ รออนุมัติ' },
  { href: '/dashboard/ads', label: '📢 จัดการโฆษณา' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen flex flex-col">
      <div className="p-5 border-b border-blue-800">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="text-2xl">📰</span>
          <div>
            <div className="font-bold leading-tight">Admin Panel</div>
            <div className="text-xs text-blue-300">ข่าวสดออนไลน์</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href.split('?')[0]);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <Link
          href="/"
          className="block px-3 py-2 text-sm text-blue-200 hover:text-white mb-1"
        >
          🌐 ดูหน้าเว็บ
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full text-left px-3 py-2 text-sm text-red-300 hover:text-red-100"
        >
          🚪 ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
