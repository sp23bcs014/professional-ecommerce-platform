import { NextResponse } from 'next/server';

// Static data that works without database writes
const staticProducts = [
  {
    id: 100,
    name: 'Modern Chair',
    description: 'A stylish and comfortable chair for your living room.',
    price: 129.99,
    imageUrl: '/chair.jpg',
    stock: 10,
    isActive: true,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categoryId: null,
    category: null,
    reviews: [],
    images: [],
    _count: { reviews: 0 }
  },
  {
    id: 101,
    name: 'Elegant Lamp',
    description: 'Brighten up your space with this elegant lamp.',
    price: 59.99,
    imageUrl: '/lamp.jpg',
    stock: 15,
    isActive: true,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categoryId: null,
    category: null,
    reviews: [],
    images: [],
    _count: { reviews: 0 }
  },
  {
    id: 102,
    name: 'Wooden Table',
    description: 'A sturdy wooden table perfect for dining or work.',
    price: 249.99,
    imageUrl: '/table.jpg',
    stock: 5,
    isActive: true,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categoryId: null,
    category: null,
    reviews: [],
    images: [],
    _count: { reviews: 0 }
  },
  {
    id: 103,
    name: 'Perfume',
    description: 'A fresh scent for your home.',
    price: 39.99,
    imageUrl: '/perfume.jpg',
    stock: 20,
    isActive: true,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categoryId: null,
    category: null,
    reviews: [],
    images: [],
    _count: { reviews: 0 }
  },
  {
    id: 104,
    name: 'Computer Desk',
    description: 'Perfect for your home office setup.',
    price: 199.99,
    imageUrl: '/computer.jpg',
    stock: 8,
    isActive: true,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categoryId: null,
    category: null,
    reviews: [],
    images: [],
    _count: { reviews: 0 }
  },
  {
    id: 105,
    name: 'Smart Watch',
    description: 'Stay connected in style.',
    price: 99.99,
    imageUrl: '/watch.jpg',
    stock: 12,
    isActive: true,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categoryId: null,
    category: null,
    reviews: [],
    images: [],
    _count: { reviews: 0 }
  }
];

export async function POST() {
  try {
    // Return static data instead of trying to write to database
    return NextResponse.json({ 
      success: true, 
      message: `Static products loaded successfully! ${staticProducts.length} products available.`,
      admin: { email: 'admin@example.com', password: 'admin123' },
      note: 'Using static data due to serverless database limitations'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to load static data',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  // Return the static products for testing
  return NextResponse.json({
    products: staticProducts,
    count: staticProducts.length
  });
}
