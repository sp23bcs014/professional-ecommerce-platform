import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// GET /api/orders?userId=1 or /api/orders?all=true - list orders for user or all orders (admin)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get('userId'));
  const all = searchParams.get('all');
  
  if (all === 'true') {
    // Admin: return all orders with user info
    try {
      const orders = await prisma.order.findMany({
        include: {
          user: { select: { id: true, email: true, name: true } },
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(orders);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
  }
  
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - create order from cart
export async function POST(req: NextRequest) {
  try {
    const { userId, cartItemIds, shippingAddress } = await req.json();
    
    console.log('Creating order for user:', userId, 'items:', cartItemIds);
    
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    
    // If cartItemIds provided, filter items
    const selectedItems = Array.isArray(cartItemIds) && cartItemIds.length > 0
      ? cart.items.filter((item: any) => cartItemIds.includes(item.id))
      : cart.items;
      
    if (selectedItems.length === 0) {
      return NextResponse.json({ error: 'No items selected' }, { status: 400 });
    }
    
    console.log('Selected items for order:', selectedItems.map((i: any) => ({ id: i.id, productId: i.productId, quantity: i.quantity })));
    
    // Use a transaction to ensure both order creation and cart cleanup happen together
    const result = await prisma.$transaction(async (tx: any) => {
      // Get product details for the order items
      const items = await Promise.all(
        selectedItems.map(async (item: any) => {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          };
        })
      );
      
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      // Create the order
      const order = await tx.order.create({
        data: {
          userId,
          total,
          shippingAddress: shippingAddress || null,
          items: { create: items },
        },
        include: { items: { include: { product: true } }, user: true },
      });
      
      console.log('Order created:', order.id);
      
      // Remove only checked out items from cart
      const deletedItems = await tx.cartItem.deleteMany({ 
        where: { id: { in: selectedItems.map((i: any) => i.id) } } 
      });
      
      console.log('Deleted cart items:', deletedItems.count);
      
      return order;
    });

    // Send order confirmation email (outside transaction to avoid blocking)
    if (result.user?.email) {
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
        
        const itemsHtml = result.items.map((item: any) => 
          `<li>${item.quantity} x ${item.product?.name || `Product ${item.productId}`} ($${item.price.toFixed(2)} each)</li>`
        ).join('');
        
        await transporter.sendMail({
          from: 'Your Business Name <no-reply@yourdomain.com>',
          to: result.user.email,
          subject: `Order Confirmation - Order #${result.id}`,
          text: `Thank you for your order!\n\nOrder #${result.id}\nTotal: $${result.total.toFixed(2)}\n\nItems:\n${result.items.map((item: any) => `${item.quantity} x ${item.product?.name || `Product ${item.productId}`} ($${item.price.toFixed(2)} each)`).join('\n')}`,
          html: `<h2>Thank you for your order!</h2><p>Order <b>#${result.id}</b></p><p>Total: <b>$${result.total.toFixed(2)}</b></p><ul>${itemsHtml}</ul>`
        });
        
        console.log('Order confirmation email sent to:', result.user.email);
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail the order if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      order: result,
      message: 'Order created successfully'
    });
    
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create order' 
    }, { status: 500 });
  }
}

// PUT /api/orders - update order status (admin)
export async function PUT(req: NextRequest) {
  try {
    const { orderId, status } = await req.json();
    if (!orderId || !status) return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { user: true, items: { include: { product: true } } },
    });
    
    // Send email notification to user
    if (order.user?.email) {
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
          from: 'Fraz Modern Store <no-reply@frazmodern.com>',
          to: order.user.email,
          subject: `Order Status Update - Order #${order.id}`,
          html: `<h2>Order Status Update</h2><p>Your order <b>#${order.id}</b> status has been updated to: <b>${status}</b></p>`
        });
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }
    }
    
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
