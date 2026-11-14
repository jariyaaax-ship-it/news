import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET admin stats
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const [pending, approved, rejected, totalUsers] = await Promise.all([
    db.article.count({ where: { status: 'PENDING' } }),
    db.article.count({ where: { status: 'APPROVED' } }),
    db.article.count({ where: { status: 'REJECTED' } }),
    db.user.count(),
  ]);

  return NextResponse.json({ pending, approved, rejected, totalUsers });
}
