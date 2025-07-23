import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// GET /api/auth/profile?userId=1 - fetch user profile
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get('userId'));
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true, avatar: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/auth/profile - update user profile (with avatar upload support)
export async function PUT(req: NextRequest) {
  try {
    let data: any = {};
    let userId: number | undefined;
    let isMultipart = req.headers.get('content-type')?.includes('multipart/form-data');
    if (isMultipart) {
      // Parse multipart form
      const formData = await req.formData();
      userId = Number(formData.get('userId'));
      if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      if (formData.get('name')) data.name = formData.get('name');
      if (formData.get('email')) data.email = formData.get('email');
      if (formData.get('password')) {
        const bcrypt = (await import('bcryptjs')).default;
        data.password = await bcrypt.hash(formData.get('password') as string, 10);
      }
      // Handle avatar upload
      const file = formData.get('avatar') as File | null;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = path.extname(file.name) || '.jpg';
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const uploadPath = path.join(process.cwd(), 'public', 'uploads', fileName);
        await fs.writeFile(uploadPath, buffer);
        data.avatar = `/uploads/${fileName}`;
      }
    } else {
      // JSON body
      const body = await req.json();
      userId = body.userId;
      if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      if (body.name) data.name = body.name;
      if (body.email) data.email = body.email;
      if (body.password) {
        data.password = await bcrypt.hash(body.password, 10);
      }
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, createdAt: true, avatar: true },
    });
    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
} 