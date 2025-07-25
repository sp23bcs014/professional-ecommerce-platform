import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      name: 'Admin User',
      isAdmin: true,
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create categories
  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
    { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel' },
    { name: 'Home & Garden', slug: 'home-garden', description: 'Home decoration and garden items' },
    { name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  console.log('✅ Categories created')

  // Get category IDs
  const electronicsCategory = await prisma.category.findUnique({ where: { slug: 'electronics' } })
  const clothingCategory = await prisma.category.findUnique({ where: { slug: 'clothing' } })
  const homeCategory = await prisma.category.findUnique({ where: { slug: 'home-garden' } })

  // Create products
  const products = [
    {
      name: 'Professional Laptop',
      description: 'High-performance laptop for professionals',
      price: 1299.99,
      imageUrl: '/computer.jpg',
      sku: 'LAPTOP001',
      stock: 50,
      categoryId: electronicsCategory?.id,
      tags: 'laptop,computer,professional',
    },
    {
      name: 'Wireless Headphones',
      description: 'Premium wireless headphones with noise cancellation',
      price: 299.99,
      imageUrl: '/New-5-pro.jpg',
      sku: 'HEADPHONE001',
      stock: 100,
      categoryId: electronicsCategory?.id,
      tags: 'headphones,wireless,audio',
    },
    {
      name: 'Smartwatch',
      description: 'Advanced smartwatch with health tracking',
      price: 399.99,
      imageUrl: '/watch.jpg',
      sku: 'WATCH001',
      stock: 75,
      categoryId: electronicsCategory?.id,
      tags: 'watch,smart,fitness',
    },
    {
      name: 'Designer T-Shirt',
      description: 'Premium quality cotton t-shirt',
      price: 49.99,
      imageUrl: '/shirt.jpg',
      sku: 'SHIRT001',
      stock: 200,
      categoryId: clothingCategory?.id,
      tags: 'shirt,cotton,casual',
    },
    {
      name: 'Table Lamp',
      description: 'Modern LED table lamp with adjustable brightness',
      price: 89.99,
      imageUrl: '/lamp.jpg',
      sku: 'LAMP001',
      stock: 60,
      categoryId: homeCategory?.id,
      tags: 'lamp,led,modern',
    },
    {
      name: 'Office Chair',
      description: 'Ergonomic office chair with lumbar support',
      price: 299.99,
      imageUrl: '/chair.jpg',
      sku: 'CHAIR001',
      stock: 30,
      categoryId: homeCategory?.id,
      tags: 'chair,office,ergonomic',
    },
    {
      name: 'Dining Table',  
      description: 'Solid wood dining table for 6 people',
      price: 799.99,
      imageUrl: '/table.jpg',
      sku: 'TABLE001',
      stock: 15,
      categoryId: homeCategory?.id,
      tags: 'table,dining,wood',
    },
    {
      name: 'Luxury Perfume',
      description: 'Premium fragrance with long-lasting scent',
      price: 129.99,
      imageUrl: '/perfume.jpg',
      sku: 'PERFUME001',
      stock: 80,
      categoryId: clothingCategory?.id,
      tags: 'perfume,fragrance,luxury',
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    })
  }

  console.log('✅ Products created')

  // Create a regular user for testing
  const regularUserPassword = await bcrypt.hash('user123', 10)
  
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password: regularUserPassword,
      name: 'Test User',
      isAdmin: false,
    },
  })

  console.log('✅ Test user created:', regularUser.email)

  console.log('🎉 Database seeded successfully!')
  console.log('\n📧 Login credentials:')
  console.log('Admin: admin@ecommerce.com / admin123')
  console.log('User: user@test.com / user123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
