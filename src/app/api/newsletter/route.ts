import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

// GET /api/newsletter - list all newsletter subscribers (admin)
export async function GET() {
  try {
    const subscribers = await prisma.newsletter.findMany({
      where: { isActive: true },
      orderBy: { subscribedAt: 'desc' }
    });
    return NextResponse.json(subscribers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

// POST /api/newsletter - subscribe to newsletter
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.newsletter.findUnique({
      where: { email }
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ error: 'Email already subscribed' }, { status: 400 });
      } else {
        // Reactivate subscription
        const updated = await prisma.newsletter.update({
          where: { email },
          data: { isActive: true, subscribedAt: new Date() }
        });
        return NextResponse.json(updated);
      }
    }

    // Create new subscription
    const subscription = await prisma.newsletter.create({
      data: { email }
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

// DELETE /api/newsletter - unsubscribe from newsletter
export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await prisma.newsletter.update({
      where: { email },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
