import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"
import Papa from 'papaparse';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, description: true, price: true, stock: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    const csv = Papa.unparse(products);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="products.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export products' }, { status: 500 });
  }
} 