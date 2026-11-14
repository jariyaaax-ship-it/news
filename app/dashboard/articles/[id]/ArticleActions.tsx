'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  status: string;
  showAds: boolean;
  author: { name: string; email: string };
  createdAt: string;
  publishedAt: string | null;
}

export function ArticleActions({ article }: { article: Article }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function action(payload: object, label: string) {
    setLoading(label);
    try {
      await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function deleteArticle() {
    if (!confirm('ต้องการลบบทความนี้หรือไม่?')) return;
    setLoading('delete');
    await fetch(`/api/articles/${article.id}`, { method: 'DELETE' });
    router.push('/dashboard/articles');
  }

  return (
    <div className="card p-5">
      <h3 className="font-bold text-gray-800 mb-4">⚙️ การดำเนินการ</h3>

      <div className="space-y-3">
        {/* Approve / Reject */}
        {article.status === 'PENDING' && (
          <div className="flex gap-2">
            <button
              onClick={() => action({ status: 'APPROVED' }, 'approve')}
              disabled={!!loading}
              className="flex-1 btn-success text-sm disabled:opacity-60"
            >
              {loading === 'approve' ? '⏳' : '✅'} อนุมัติ
            </button>
            <button
              onClick={() => action({ status: 'REJECTED' }, 'reject')}
              disabled={!!loading}
              className="flex-1 btn-danger text-sm disabled:opacity-60"
            >
              {loading === 'reject' ? '⏳' : '❌'} ปฏิเสธ
            </button>
          </div>
        )}

        {article.status === 'APPROVED' && (
          <button
            onClick={() => action({ status: 'PENDING' }, 'unpublish')}
            disabled={!!loading}
            className="w-full btn-secondary text-sm disabled:opacity-60"
          >
            {loading === 'unpublish' ? '⏳' : '⏸️'} ยกเลิกการเผยแพร่
          </button>
        )}

        {article.status === 'REJECTED' && (
          <button
            onClick={() => action({ status: 'APPROVED' }, 're-approve')}
            disabled={!!loading}
            className="w-full btn-success text-sm disabled:opacity-60"
          >
            {loading === 're-approve' ? '⏳' : '🔄'} อนุมัติใหม่
          </button>
        )}

        {/* Toggle Ads */}
        {article.status === 'APPROVED' && (
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">📢 Google AdSense</p>
                <p className="text-xs text-gray-400">แสดงโฆษณาในบทความนี้</p>
              </div>
              <button
                onClick={() => action({ showAds: !article.showAds }, 'ads')}
                disabled={!!loading}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-60 ${
                  article.showAds ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  article.showAds ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            {article.showAds && (
              <p className="text-xs text-green-600 mt-2">✅ โฆษณาเปิดอยู่ในบทความนี้</p>
            )}
          </div>
        )}

        {/* Delete */}
        <button
          onClick={deleteArticle}
          disabled={!!loading}
          className="w-full text-sm text-red-600 hover:text-red-800 py-2 disabled:opacity-60"
        >
          {loading === 'delete' ? '⏳ กำลังลบ...' : '🗑️ ลบบทความ'}
        </button>
      </div>
    </div>
  );
}
