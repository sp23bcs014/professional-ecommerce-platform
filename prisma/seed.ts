import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
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

  console.log('Admin user created: admin@example.com / admin123');

  // Create products
  await prisma.product.createMany({
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

  console.log('✅ Database seeded successfully!');
  console.log('🛍️ Added products to the store');
  console.log('👨‍💼 Admin login: admin@example.com / admin123');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  }); 