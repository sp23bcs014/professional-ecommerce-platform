import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [products, users] = await Promise.all([
      prisma.product.findMany(),
      prisma.user.findMany({
        select: { id: true, email: true, name: true, isAdmin: true }
      })
    ]);

    return NextResponse.json({
      products: {
        count: products.length,
        items: products.map((p: any) => ({ id: p.id, name: p.name, price: p.price }))
      },
      users: {
        count: users.length,
        items: users
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch debug info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
