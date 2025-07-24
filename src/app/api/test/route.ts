import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Just test the connection
    await prisma.$connect();
    
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    
    return NextResponse.json({
      success: true,
      connection: 'OK',
      users: userCount,
      products: productCount,
      database: 'Connected successfully'
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error?.message || 'Unknown error',
      code: error?.code,
      meta: error?.meta
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
