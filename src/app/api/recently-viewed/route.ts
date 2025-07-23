import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

// GET /api/recently-viewed?userId=1 - get recently viewed products
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get('userId'));

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const recentlyViewed = await prisma.recentlyViewed.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            reviews: {
              select: { rating: true }
            },
            category: true
          }
        }
      },
      orderBy: { viewedAt: 'desc' },
      take: 10
    });

    // Calculate average rating for each product
    const productsWithRating = recentlyViewed.map(item => ({
      ...item.product,
      viewedAt: item.viewedAt,
      rating: item.product.reviews.length > 0 
        ? item.product.reviews.reduce((sum, r) => sum + r.rating, 0) / item.product.reviews.length
        : null
    }));

    return NextResponse.json(productsWithRating);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recently viewed products' }, { status: 500 });
  }
}

// POST /api/recently-viewed - add product to recently viewed
export async function POST(req: NextRequest) {
  try {
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json({ error: 'Missing userId or productId' }, { status: 400 });
    }

    // Check if already exists
    const existing = await prisma.recentlyViewed.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existing) {
      // Update the viewed time
      await prisma.recentlyViewed.update({
        where: {
          userId_productId: {
            userId,
            productId
          }
        },
        data: { viewedAt: new Date() }
      });
    } else {
      // Create new record
      await prisma.recentlyViewed.create({
        data: { userId, productId }
      });
    }

    // Update product view count
    await prisma.product.update({
      where: { id: productId },
      data: {
        views: {
          increment: 1
        }
      }
    });

    // Keep only the last 50 viewed products per user
    const recentlyViewedCount = await prisma.recentlyViewed.count({
      where: { userId }
    });

    if (recentlyViewedCount > 50) {
      const oldestViewed = await prisma.recentlyViewed.findMany({
        where: { userId },
        orderBy: { viewedAt: 'asc' },
        take: recentlyViewedCount - 50
      });

      await prisma.recentlyViewed.deleteMany({
        where: {
          id: {
            in: oldestViewed.map(item => item.id)
          }
        }
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to recently viewed' }, { status: 500 });
  }
}
