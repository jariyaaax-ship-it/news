import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import slugify from 'slugify';

// GET all published articles (public)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status') || 'APPROVED';
  const limit = parseInt(searchParams.get('limit') || '10');
  const page = parseInt(searchParams.get('page') || '1');

  const where: any = {};
  if (status !== 'ALL') where.status = status;
  if (category) where.category = category;

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      include: { author: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.article.count({ where }),
  ]);

  return NextResponse.json({ articles, total, page, limit });
}

// POST create article (requires login)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'กรุณาล็อกอิน' }, { status: 401 });

  try {
    const { title, content, excerpt, coverImage, category } = await req.json();

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
    }

    const baseSlug = slugify(title, { lower: true, strict: true, locale: 'th' });
    const slug = `${baseSlug}-${Date.now()}`;

    const article = await db.article.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        category,
        status: 'PENDING',
        authorId: session.user.id,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
