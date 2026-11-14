import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET single article by slug or id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const article = await db.article.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: { author: { select: { name: true } } },
  });

  if (!article) return NextResponse.json({ error: 'ไม่พบบทความ' }, { status: 404 });
  return NextResponse.json(article);
}

// PATCH update article (admin: approve/reject/toggle ads; writer: edit own)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'กรุณาล็อกอิน' }, { status: 401 });

  const body = await req.json();
  const isAdmin = session.user.role === 'ADMIN';

  // Admin can change status and ads
  const data: any = {};
  if (isAdmin) {
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === 'APPROVED') data.publishedAt = new Date();
    }
    if (body.showAds !== undefined) data.showAds = body.showAds;
    if (body.title) data.title = body.title;
    if (body.content) data.content = body.content;
  } else {
    // Writers can only edit their own PENDING articles
    const article = await db.article.findUnique({ where: { id: params.id } });
    if (!article || article.authorId !== session.user.id || article.status !== 'PENDING') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไข' }, { status: 403 });
    }
    if (body.title) data.title = body.title;
    if (body.content) data.content = body.content;
    if (body.excerpt) data.excerpt = body.excerpt;
  }

  const updated = await db.article.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}

// DELETE article (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 });
  }

  await db.article.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'ลบสำเร็จ' });
}
