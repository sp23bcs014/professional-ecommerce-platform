import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

// GET /api/products/[id]/reviews - fetch all reviews for a product
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = Number(params.id);
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/products/[id]/reviews - add a review
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = Number(params.id);
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    const { userId, rating, comment } = await req.json();
    if (!userId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    // Only one review per user per product
    const existing = await prisma.review.findFirst({ where: { productId, userId } });
    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 400 });
    }
    const review = await prisma.review.create({
      data: { productId, userId, rating, comment },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
} 