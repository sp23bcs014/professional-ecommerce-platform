import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// POST /api/auth/register - register new user
export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url);
  if (pathname.endsWith('/register')) {
    try {
      const { email, password, name } = await req.json();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashed, name },
        select: { id: true, email: true, name: true },
      });
      return NextResponse.json(user, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
    }
  }
  // POST /api/auth/login - login user
  if (pathname.endsWith('/login')) {
    try {
      const { email, password } = await req.json();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      return NextResponse.json({ id: user.id, email: user.email, name: user.name });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
    }
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
} 