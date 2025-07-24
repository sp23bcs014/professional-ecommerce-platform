import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

// GET /api/products - list all products with advanced filtering
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const inStock = searchParams.get('inStock') === 'true';

  try {
    const where: any = {
      isActive: true
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } }
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    // Price filters
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    // Stock filter
    if (inStock) {
      where.stock = { gt: 0 };
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'price' || sortBy === 'createdAt' || sortBy === 'views' || sortBy === 'name') {
      orderBy[sortBy] = sortOrder;
    } else if (sortBy === 'rating') {
      // For rating, we'll need to handle this differently
      orderBy.reviews = {
        _count: sortOrder
      };
    } else {
      orderBy.createdAt = 'desc';
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          reviews: {
            select: { rating: true }
          },
          images: {
            where: { isPrimary: true },
            take: 1
          },
          _count: {
            select: { reviews: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map((product: any) => ({
      ...product,
      rating: product.reviews.length > 0 
        ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
        : null,
      primaryImage: product.images[0]?.imageUrl || product.imageUrl
    }));

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    
    // Fallback to static products when database fails (Vercel serverless issue)
    const staticProducts = [
      {
        id: 100,
        name: 'Modern Chair',
        description: 'A stylish and comfortable chair for your living room.',
        price: 129.99,
        imageUrl: '/chair.jpg',
        stock: 10,
        isActive: true,
        category: null,
        reviews: [],
        images: [],
        _count: { reviews: 0 },
        rating: null,
        primaryImage: '/chair.jpg'
      },
      {
        id: 101,
        name: 'Elegant Lamp',
        description: 'Brighten up your space with this elegant lamp.',
        price: 59.99,
        imageUrl: '/lamp.jpg',
        stock: 15,
        isActive: true,
        category: null,
        reviews: [],
        images: [],
        _count: { reviews: 0 },
        rating: null,
        primaryImage: '/lamp.jpg'
      },
      {
        id: 102,
        name: 'Wooden Table',
        description: 'A sturdy wooden table perfect for dining or work.',
        price: 249.99,
        imageUrl: '/table.jpg',
        stock: 5,
        isActive: true,
        category: null,
        reviews: [],
        images: [],
        _count: { reviews: 0 },
        rating: null,
        primaryImage: '/table.jpg'
      },
      {
        id: 103,
        name: 'Perfume',
        description: 'A fresh scent for your home.',
        price: 39.99,
        imageUrl: '/perfume.jpg',
        stock: 20,
        isActive: true,
        category: null,
        reviews: [],
        images: [],
        _count: { reviews: 0 },
        rating: null,
        primaryImage: '/perfume.jpg'
      },
      {
        id: 104,
        name: 'Computer Desk',
        description: 'Perfect for your home office setup.',
        price: 199.99,
        imageUrl: '/computer.jpg',
        stock: 8,
        isActive: true,
        category: null,
        reviews: [],
        images: [],
        _count: { reviews: 0 },
        rating: null,
        primaryImage: '/computer.jpg'
      },
      {
        id: 105,
        name: 'Smart Watch',
        description: 'Stay connected in style.',
        price: 99.99,
        imageUrl: '/watch.jpg',
        stock: 12,
        isActive: true,
        category: null,
        reviews: [],
        images: [],
        _count: { reviews: 0 },
        rating: null,
        primaryImage: '/watch.jpg'
      }
    ];

    return NextResponse.json({
      products: staticProducts,
      pagination: {
        page: 1,
        limit: staticProducts.length,
        total: staticProducts.length,
        pages: 1
      },
      fallback: true,
      note: 'Using static data due to database connectivity issues'
    });
  }
}

// POST /api/products - create a new product
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        sku: data.sku,
        stock: data.stock ?? 0,
        categoryId: data.categoryId,
        tags: data.tags ? JSON.stringify(data.tags) : null
      },
      include: {
        category: true
      }
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
} 