import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        isAdmin: true,
      },
    });

    // Create products
    await prisma.product.createMany({
      skipDuplicates: true,
      data: [
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
        },
        {
          name: 'Perfume',
          description: 'A fresh scent for your home.',
          price: 39.99,
          imageUrl: '/perfume.jpg',
          stock: 20,
        },
        {
          name: 'Computer Desk',
          description: 'Perfect for your home office setup.',
          price: 199.99,
          imageUrl: '/computer.jpg',
          stock: 8,
        },
        {
          name: 'Smart Watch',
          description: 'Stay connected in style.',
          price: 99.99,
          imageUrl: '/watch.jpg',
          stock: 12,
        },
        {
          name: 'Shirt',
          description: 'Comfortable and stylish shirt.',
          price: 29.99,
          imageUrl: '/shirt.jpg',
          stock: 30,
        },
        {
          name: 'Bed',
          description: 'A cozy bed for restful nights.',
          price: 499.99,
          imageUrl: '/bed.jpg',
          stock: 3,
        },
        {
          name: 'Pro Phone',
          description: 'Latest smartphone for your needs.',
          price: 899.99,
          imageUrl: '/New-5-pro.jpg',
          stock: 7,
        },
      ],
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully!',
      admin: { email: 'admin@example.com', password: 'admin123' }
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to seed database' 
    }, { status: 500 });
  }
}
