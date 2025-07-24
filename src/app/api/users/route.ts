import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

// GET /api/users - list all users (admin)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// PUT /api/users - update isAdmin for a user (admin)
export async function PUT(req: NextRequest) {
  try {
    const { userId, isAdmin } = await req.json();
    if (!userId || typeof isAdmin !== 'boolean') return NextResponse.json({ error: 'Missing userId or isAdmin' }, { status: 400 });
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
      select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users - delete a user (admin)
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    
    // Check if user exists first
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // First delete related data (orders, reviews, etc.) in a transaction
    await prisma.$transaction(async (tx: any) => {
      // Delete reviews first
      await tx.review.deleteMany({ where: { userId } });
      
      // Delete orders 
      await tx.order.deleteMany({ where: { userId } });
      
      // Delete cart and cart items
      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
        await tx.cart.delete({ where: { userId } });
      }
      
      // Delete wishlist and wishlist items
      const userWishlist = await tx.wishlist.findUnique({ where: { userId } });
      if (userWishlist) {
        await tx.wishlistItem.deleteMany({ where: { wishlistId: userWishlist.id } });
        await tx.wishlist.delete({ where: { userId } });
      }
      
      // Delete recently viewed items
      await tx.recentlyViewed.deleteMany({ where: { userId } });
      
      // Delete activity logs
      await tx.activityLog.deleteMany({ where: { userId } });
      
      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });
    
    return NextResponse.json({ 
      message: 'User deleted successfully', 
      user: existingUser 
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ 
      error: `Failed to delete user: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
} 