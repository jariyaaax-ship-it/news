import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-blue-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">📰</span>
              <span className="font-bold text-xl">{process.env.NEXT_PUBLIC_SITE_NAME || 'ข่าวสดออนไลน์'}</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              แหล่งข่าวออนไลน์ครบทุกมิติ นำเสนอข่าวสารที่ทันเหตุการณ์ น่าเชื่อถือ 
              และตรวจสอบได้ โดยทีมนักข่าวมืออาชีพ
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-blue-100">หมวดหมู่</h3>
            <ul className="space-y-1.5 text-sm text-blue-200">
              {['การเมือง', 'เศรษฐกิจ', 'กีฬา', 'บันเทิง', 'เทคโนโลยี', 'สุขภาพ'].map((cat) => (
                <li key={cat}>
                  <Link href={`/category/${encodeURIComponent(cat)}`} className="hover:text-white transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-blue-100">ลิงก์</h3>
            <ul className="space-y-1.5 text-sm text-blue-200">
              <li><Link href="/" className="hover:text-white">หน้าแรก</Link></li>
              <li><Link href="/register" className="hover:text-white">สมัครสมาชิก</Link></li>
              <li><Link href="/login" className="hover:text-white">เข้าสู่ระบบ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-blue-300">
          <p>© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME || 'ข่าวสดออนไลน์'}. สงวนสิทธิ์ทุกประการ</p>
          <p>สร้างด้วย Next.js + Google AdSense</p>
        </div>
      </div>
    </footer>
  );
}
