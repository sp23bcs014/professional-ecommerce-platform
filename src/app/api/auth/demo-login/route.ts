import { NextResponse } from 'next/server';

// Mock admin accounts for demo purposes (since database writes fail on Vercel)
const mockUsers = [
  {
    id: 1,
    email: 'admin@demo.com',
    password: 'admin123', // In real app, this would be hashed
    name: 'Demo Admin',
    isAdmin: true
  },
  {
    id: 2,
    email: 'demo@example.com', 
    password: 'demo123',
    name: 'Demo User',
    isAdmin: false
  }
];

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    // Check mock users first
    const mockUser = mockUsers.find(u => u.email === email && u.password === password);
    if (mockUser) {
      return NextResponse.json({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        isAdmin: mockUser.isAdmin,
        mock: true // Flag to indicate this is mock data
      });
    }

    // If not found in mock users, return error
    return NextResponse.json({ 
      error: 'Invalid credentials. Try: admin@demo.com / admin123' 
    }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Login failed',
      hint: 'Try: admin@demo.com / admin123'
    }, { status: 500 });
  }
}
