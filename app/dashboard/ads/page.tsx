import { db } from '@/lib/db';
import { AdToggle } from './AdToggle';

export const dynamic = 'force-dynamic';

const POSITION_LABELS: Record<string, string> = {
  header: '🏷️ Header (แบนเนอร์บน)',
  sidebar: '📌 Sidebar (ด้านข้าง)',
  'in-content': '📄 In-Content (กลางบทความ)',
  footer: '📋 Footer (ด้านล่าง)',
};

const DEFAULT_AD_UNITS = [
  { name: 'Header Banner', slot: '1234567890', position: 'header' },
  { name: 'Sidebar Rectangle', slot: '0987654321', position: 'sidebar' },
  { name: 'In-Content', slot: '1122334455', position: 'in-content' },
  { name: 'Footer Banner', slot: '9988776655', position: 'footer' },
];

export default async function AdsPage() {
  // Seed default ad units if not exist
  for (const unit of DEFAULT_AD_UNITS) {
    await db.adUnit.upsert({
      where: { slot: unit.slot },
      update: {},
      create: { ...unit, isActive: false },
    });
  }

  const adUnits = await db.adUnit.findMany({ orderBy: { position: 'asc' } });

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const hasRealClient = clientId && !clientId.includes('XXXX');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📢 จัดการ Google AdSense</h1>
        <p className="text-gray-500 text-sm mt-1">ตั้งค่า Ad Units และควบคุมการแสดงโฆษณา</p>
      </div>

      {/* AdSense Status */}
      <div className={`card p-5 mb-6 border-l-4 ${hasRealClient ? 'border-green-500' : 'border-yellow-400'}`}>
        <div className="flex items-start gap-4">
          <span className="text-3xl">{hasRealClient ? '✅' : '⚠️'}</span>
          <div>
            <h2 className="font-bold text-gray-800">
              {hasRealClient ? 'Google AdSense พร้อมใช้งาน' : 'ยังไม่ได้เชื่อมต่อ AdSense'}
            </h2>
            {hasRealClient ? (
              <p className="text-sm text-gray-600 mt-1">Publisher ID: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{clientId}</code></p>
            ) : (
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p>ขั้นตอนการเชื่อมต่อ AdSense:</p>
                <ol className="list-decimal pl-4 space-y-1 text-sm">
                  <li>สมัครที่ <a href="https://www.google.com/adsense" target="_blank" className="text-blue-700 underline">google.com/adsense</a></li>
                  <li>รอ Google review เว็บไซต์ (1-14 วัน)</li>
                  <li>เมื่ออนุมัติแล้ว นำ Publisher ID มาใส่ใน <code className="bg-gray-100 px-1">.env.local</code></li>
                  <li>อัปเดต <code className="bg-gray-100 px-1">public/ads.txt</code> ด้วย Publisher ID จริง</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ad units table */}
      <div className="card overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Ad Units</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">ชื่อ Ad Unit</th>
              <th className="text-left px-5 py-3">ตำแหน่ง</th>
              <th className="text-left px-5 py-3">Slot ID</th>
              <th className="text-left px-5 py-3">สถานะ</th>
              <th className="px-5 py-3">เปิด/ปิด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {adUnits.map((ad) => (
              <tr key={ad.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium text-gray-800">{ad.name}</td>
                <td className="px-5 py-4 text-gray-600">{POSITION_LABELS[ad.position] || ad.position}</td>
                <td className="px-5 py-4">
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{ad.slot}</code>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {ad.isActive ? 'เปิดอยู่' : 'ปิดอยู่'}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <AdToggle ad={ad} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ads.txt info */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-800 mb-3">📄 ไฟล์ ads.txt</h2>
        <p className="text-sm text-gray-600 mb-3">
          ไฟล์ <code className="bg-gray-100 px-1.5 py-0.5 rounded">public/ads.txt</code> ต้องมีข้อมูลนี้ (แก้ Publisher ID ให้ถูกต้อง):
        </p>
        <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto">
          {`google.com, ${clientId || 'ca-pub-XXXXXXXXXXXXXXXX'}, DIRECT, f08c47fec0942fa0`}
        </pre>
        <p className="text-xs text-gray-400 mt-2">
          ✅ ตรวจสอบได้ที่: yourdomain.com/ads.txt
        </p>
      </div>
    </div>
  );
}
