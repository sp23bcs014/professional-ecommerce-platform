import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
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
    
    // Send welcome email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_HOST_USER,
          pass: process.env.SMTP_PASS || process.env.EMAIL_HOST_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: 'Your Business Name <no-reply@yourdomain.com>',
        to: user.email,
        subject: 'Welcome to Our Store!',
        text: `Welcome ${user.name || 'valued customer'}!\n\nThank you for joining our store. We're excited to have you as part of our community.\n\nStart shopping now and discover amazing products!\n\nBest regards,\nYour Store Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; text-align: center;">Welcome to Our Store!</h2>
            <p>Hi ${user.name || 'valued customer'},</p>
            <p>Thank you for joining our store! We're excited to have you as part of our community.</p>
            <p>Here's what you can do now:</p>
            <ul>
              <li>Browse our amazing product collection</li>
              <li>Add items to your wishlist</li>
              <li>Enjoy secure checkout with multiple payment options</li>
              <li>Track your orders in real-time</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Start Shopping Now
              </a>
            </div>
            <p>Welcome aboard!</p>
            <p><strong>Your Store Team</strong></p>
          </div>
        `
      });
      
      console.log('Welcome email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
} 