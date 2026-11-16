import { createHmac, randomInt } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { isEmailConfigured, sendRegistrationCode } from '@/lib/email';

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_DELAY_MS = 60 * 1000;

function hashCode(email: string, code: string) {
  return createHmac('sha256', process.env.NEXTAUTH_SECRET || 'local-verification-key')
    .update(`${email}:${code}`)
    .digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
    }
    if (name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'กรุณาตรวจสอบชื่อและอีเมล' }, { status: 400 });
    }
    if (password.length < 6 || Buffer.byteLength(password, 'utf8') > 72) {
      return NextResponse.json({ error: 'รหัสผ่านต้องมี 6–72 ตัวอักษร' }, { status: 400 });
    }
    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: 'ระบบส่งอีเมลยังไม่ได้ตั้งค่า กรุณาติดต่อผู้ดูแลระบบ' },
        { status: 503 },
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 409 });
    }

    const existingVerification = await db.emailVerification.findUnique({ where: { email } });
    const now = new Date();
    if (existingVerification && now.getTime() - existingVerification.createdAt.getTime() < RESEND_DELAY_MS) {
      return NextResponse.json(
        { error: 'ส่งรหัสไปแล้ว กรุณารอ 1 นาทีก่อนขอรหัสใหม่' },
        { status: 429 },
      );
    }

    const code = randomInt(100000, 1000000).toString();
    const codeHash = hashCode(email, code);
    const hashedPassword = await bcrypt.hash(password, 12);
    const expiresAt = new Date(now.getTime() + CODE_TTL_MS);

    await db.emailVerification.upsert({
      where: { email },
      update: { name, password: hashedPassword, codeHash, expiresAt, attempts: 0, createdAt: now },
      create: { email, name, password: hashedPassword, codeHash, expiresAt },
    });

    try {
      await sendRegistrationCode({ to: email, name, code });
    } catch (error) {
      await db.emailVerification.deleteMany({ where: { email, codeHash } });
      console.error('Registration email could not be sent:', error);
      return NextResponse.json(
        { error: 'ส่งอีเมลไม่สำเร็จ กรุณาตรวจสอบอีเมลแล้วลองใหม่' },
        { status: 502 },
      );
    }

    return NextResponse.json({ message: 'ส่งรหัสยืนยันไปยังอีเมลแล้ว' });
  } catch (error) {
    console.error('Registration request failed:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}
