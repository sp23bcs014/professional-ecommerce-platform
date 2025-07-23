import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { subject, content } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    // Get all newsletter subscribers
    const subscribers = await prisma.newsletter.findMany({
      select: { email: true }
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No subscribers found' },
        { status: 400 }
      );
    }

    // Prepare HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .unsubscribe { color: #6b7280; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Fraz Modern</h1>
          </div>
          <div class="content">
            ${content.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>Thank you for subscribing to our newsletter!</p>
            <p>© ${new Date().getFullYear()} Fraz Modern. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails to all subscribers
    const emailPromises = subscribers.map((subscriber: { email: string }) =>
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: subscriber.email,
        subject: subject,
        html: htmlContent,
      })
    );

    await Promise.all(emailPromises);

    return NextResponse.json({ 
      message: `Campaign sent successfully to ${subscribers.length} subscribers` 
    });

  } catch (error) {
    console.error('Error sending newsletter campaign:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
