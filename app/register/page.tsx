'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [step, setStep] = useState<'details' | 'verification'>('details');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  async function requestCode(e?: FormEvent) {
    e?.preventDefault();
    setError('');
    setNotice('');

    if (!form.name.trim() || !form.email.trim()) {
      return setError('กรุณากรอกชื่อและอีเมล');
    }
    if (form.password !== form.confirm) {
      return setError('รหัสผ่านไม่ตรงกัน');
    }
    if (form.password.length < 6) {
      return setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'ส่งรหัสยืนยันไม่สำเร็จ');
      } else {
        setStep('verification');
        setNotice(`ส่งรหัสยืนยันไปที่ ${form.email.trim()} แล้ว`);
      }
    } catch {
      setError('เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!/^\d{6}$/.test(code)) {
      return setError('กรุณากรอกรหัสยืนยัน 6 หลัก');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'ยืนยันรหัสไม่สำเร็จ');
      } else {
        router.push('/login?registered=1');
      }
    } catch {
      setError('เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-900 hover:opacity-80">
            <span className="text-4xl">📰</span>
            <span className="font-bold text-xl">{process.env.NEXT_PUBLIC_SITE_NAME || 'ข่าวสดออนไลน์'}</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">สมัครสมาชิก</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 'details' ? 'สร้างบัญชีใหม่ฟรี' : 'กรอกรหัส 6 หลักที่ส่งไปยังอีเมลของคุณ'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            ⚠️ {error}
          </div>
        )}
        {notice && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
            {notice}
          </div>
        )}

        {step === 'details' ? (
          <form onSubmit={requestCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="สมชาย ใจดี"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="อย่างน้อย 6 ตัว"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              required
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? '⏳ กำลังส่งรหัส...' : 'ส่งรหัสยืนยันทางอีเมล'}
          </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสยืนยัน</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••"
              />
              <p className="mt-2 text-xs text-gray-500">รหัสมีอายุ 10 นาที และกรอกผิดได้ไม่เกิน 5 ครั้ง</p>
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full btn-primary py-3 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? '⏳ กำลังตรวจสอบ...' : 'ยืนยันอีเมลและสมัครสมาชิก'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => requestCode()}
              className="w-full py-2 text-sm font-medium text-blue-700 hover:underline disabled:opacity-60"
            >
              ส่งรหัสอีกครั้ง
            </button>
            <button
              type="button"
              onClick={() => { setStep('details'); setError(''); setNotice(''); }}
              className="w-full py-2 text-sm text-gray-500 hover:underline"
            >
              กลับไปแก้ไขข้อมูล
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="text-blue-700 font-medium hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
