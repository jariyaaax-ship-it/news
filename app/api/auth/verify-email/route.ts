import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const MAX_ATTEMPTS = 5;

function hashCode(email: string, code: string) {
  return createHmac('sha256', process.env.NEXTAUTH_SECRET || 'local-verification-key')
    .update(`${email}:${code}`)
    .digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const code = typeof body.code === 'string' ? body.code.trim() : '';

    if (!email || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'กรุณากรอกรหัสยืนยัน 6 หลัก' }, { status: 400 });
    }

    const pending = await db.emailVerification.findUnique({ where: { email } });
    if (!pending) {
      return NextResponse.json({ error: 'ไม่พบคำขอสมัคร กรุณาสมัครใหม่เพื่อรับรหัส' }, { status: 404 });
    }
    if (pending.expiresAt.getTime() <= Date.now()) {
      await db.emailVerification.delete({ where: { email } });
      return NextResponse.json({ error: 'รหัสหมดอายุแล้ว กรุณาขอรหัสใหม่' }, { status: 410 });
    }
    if (pending.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'กรอกรหัสผิดเกินจำนวนครั้ง กรุณาขอรหัสใหม่' }, { status: 429 });
    }

    const submittedHash = Buffer.from(hashCode(email, code), 'hex');
    const expectedHash = Buffer.from(pending.codeHash, 'hex');
    const valid = submittedHash.length === expectedHash.length && timingSafeEqual(submittedHash, expectedHash);
    if (!valid) {
      const updated = await db.emailVerification.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });
      const attempts = updated.attempts;
      return NextResponse.json(
        { error: attempts >= MAX_ATTEMPTS ? 'กรอกรหัสผิดเกินจำนวนครั้ง กรุณาขอรหัสใหม่' : 'รหัสยืนยันไม่ถูกต้อง' },
        { status: attempts >= MAX_ATTEMPTS ? 429 : 400 },
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      await db.emailVerification.deleteMany({ where: { email } });
      return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 409 });
    }

    await db.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          name: pending.name,
          email,
          password: pending.password,
          role: 'USER',
        },
      });
      await tx.emailVerification.delete({ where: { email } });
    });

    return NextResponse.json({ message: 'ยืนยันอีเมลและสมัครสมาชิกสำเร็จ' });
  } catch (error) {
    console.error('Email verification failed:', error);
    return NextResponse.json({ error: 'ยืนยันอีเมลไม่สำเร็จ กรุณาลองใหม่' }, { status: 500 });
  }
}
