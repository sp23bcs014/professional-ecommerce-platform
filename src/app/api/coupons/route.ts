import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

// GET /api/coupons - list all coupons (admin) or validate coupon
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const validate = searchParams.get('validate');

  if (code && validate) {
    // Validate coupon
    try {
      const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
      });

      if (!coupon) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
      }

      if (!coupon.isActive) {
        return NextResponse.json({ error: 'Coupon is not active' }, { status: 400 });
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return NextResponse.json({ error: 'Coupon is expired or not yet valid' }, { status: 400 });
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
      }

      return NextResponse.json({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumAmount: coupon.minimumAmount
      });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
    }
  }

  // List all coupons (admin only)
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

// POST /api/coupons - create new coupon (admin only)
export async function POST(req: NextRequest) {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumAmount,
      maxUses,
      validFrom,
      validUntil
    } = await req.json();

    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minimumAmount,
        maxUses,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil)
      }
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
