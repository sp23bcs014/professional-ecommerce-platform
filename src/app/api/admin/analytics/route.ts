import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

function getMonthLabel(date: Date) {
  return date.toLocaleString('default', { month: 'short', year: '2-digit' });
}

export async function GET() {
  try {
    const [orders, users, products] = await Promise.all([
      prisma.order.findMany({ include: { items: true } }),
      prisma.user.count(),
      prisma.product.findMany(),
    ]);
    const totalSales = orders.reduce((sum: number, o: any) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalUsers = users;
    const totalProducts = products.length;
    // Best seller
    const productSales: Record<number, { name: string; sold: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        if (!productSales[item.productId]) {
          const prod = products.find((p: any) => p.id === item.productId);
          productSales[item.productId] = { name: prod?.name || 'Product', sold: 0 };
        }
        productSales[item.productId].sold += item.quantity;
      }
    }
    const bestSeller = Object.values(productSales).sort((a, b) => b.sold - a.sold)[0] || null;
    // Sales trend (last 6 months)
    const now = new Date();
    const months: { label: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      months.push({ label: getMonthLabel(start), start, end });
    }
    const trend = {
      labels: months.map(m => m.label),
      sales: months.map(m =>
        orders.filter((o: any) => {
          const d = new Date(o.createdAt);
          return d >= m.start && d <= m.end;
        }).reduce((sum: number, o: any) => sum + o.total, 0)
      ),
    };
    return NextResponse.json({ totalSales, totalOrders, totalUsers, totalProducts, bestSeller, trend });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
} 