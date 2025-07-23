import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

// GET /api/products/search?q=query - advanced product search with suggestions
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const suggestions = searchParams.get('suggestions') === 'true';

  if (!query.trim()) {
    return NextResponse.json({ products: [], suggestions: [] });
  }

  try {
    if (suggestions) {
      // Return search suggestions
      const products = await prisma.product.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { tags: { contains: query } }
              ]
            }
          ]
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          price: true
        },
        take: 5,
        orderBy: { views: 'desc' }
      });

      // Also get category suggestions
      const categories = await prisma.category.findMany({
        where: {
          name: { contains: query }
        },
        select: {
          id: true,
          name: true,
          slug: true
        },
        take: 3
      });

      return NextResponse.json({
        products,
        categories,
        suggestions: [
          ...products.map(p => ({ type: 'product', ...p })),
          ...categories.map(c => ({ type: 'category', ...c }))
        ]
      });
    }

    // Full search results
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
              { tags: { contains: query } }
            ]
          }
        ]
      },
      include: {
        category: true,
        reviews: {
          select: { rating: true }
        },
        images: {
          where: { isPrimary: true },
          take: 1
        }
      },
      orderBy: [
        { views: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50
    });

    // Calculate average rating and add primary image
    const productsWithRating = products.map(product => ({
      ...product,
      rating: product.reviews.length > 0 
        ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
        : null,
      primaryImage: product.images[0]?.imageUrl || product.imageUrl
    }));

    return NextResponse.json({ products: productsWithRating });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
