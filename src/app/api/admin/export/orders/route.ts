import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"
import Papa from 'papaparse';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const data = orders.map((o: any) => ({
      id: o.id,
      user: o.user?.email || o.userId,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
      items: JSON.stringify(o.items.map((i: any) => ({
        name: i.product?.name || i.productId,
        quantity: i.quantity,
        price: i.price,
      }))),
    }));
    const csv = Papa.unparse(data);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="orders.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export orders' }, { status: 500 });
  }
} 