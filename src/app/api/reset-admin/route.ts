import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Hash the password properly
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update both admin accounts with the correct password
    const results = await Promise.allSettled([
      prisma.user.update({
        where: { email: 'admin@client.com' },
        data: { password: hashedPassword }
      }),
      prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { password: hashedPassword }
      })
    ]);

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({ 
      success: true,
      message: `Password reset completed. ${successful} accounts updated, ${failed} failed.`,
      credentials: [
        { email: 'admin@client.com', password: 'admin123' },
        { email: 'admin@example.com', password: 'admin123' }
      ]
    });

  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to reset admin passwords',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
