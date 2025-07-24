import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Just create admin user if doesn't exist
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        isAdmin: true,
      },
    });

    // Create products only if they don't exist (check by name)
    const products = [
      {
        name: 'Modern Chair',
        description: 'A stylish and comfortable chair for your living room.',
        price: 129.99,
        imageUrl: '/chair.jpg',
        stock: 10,
      },
      {
        name: 'Elegant Lamp',
        description: 'Brighten up your space with this elegant lamp.',
        price: 59.99,
        imageUrl: '/lamp.jpg',
        stock: 15,
      },
      {
        name: 'Wooden Table',
        description: 'A sturdy wooden table perfect for dining or work.',
        price: 249.99,
        imageUrl: '/table.jpg',
        stock: 5,
      }
    ];

    let createdProducts = 0;
    for (const productData of products) {
      const existing = await prisma.product.findFirst({
        where: { name: productData.name }
      });
      
      if (!existing) {
        await prisma.product.create({
          data: productData
        });
        createdProducts++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Database seeded successfully! Created ${createdProducts} products.`,
      admin: { email: 'admin@example.com', password: 'admin123' },
      adminExists: adminUser ? 'Admin user ready' : 'Admin user created'
    });

  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to seed database',
      details: error?.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
