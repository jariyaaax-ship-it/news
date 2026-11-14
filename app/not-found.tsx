import { notFound } from 'next/navigation';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-4">📰</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-gray-500 text-lg mb-6">ไม่พบหน้าที่คุณต้องการ</p>
        <a
          href="/"
          className="btn-primary inline-block"
        >
          ← กลับหน้าแรก
        </a>
      </div>
    </div>
  );
}
