import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

// GET /api/orders/[id] - fetch a single order by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const orderId = Number(params.id);
  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
} 