# Professional E-commerce Platform

A modern, feature-rich e-commerce platform built with Next.js 14, TypeScript, and Prisma. Perfect for businesses looking to establish a professional online presence with complete user management, payment processing, and admin dashboard capabilities.

## 🚀 Features

### Customer Features
- **User Authentication** - Complete registration, login, and profile management
- **Product Catalog** - Browse products with detailed information and images
- **Shopping Cart** - Add/remove items with persistent cart state
- **Secure Checkout** - Stripe payment integration with order confirmation
- **Order History** - Track orders and view purchase history
- **Email Notifications** - Automated order confirmations and updates

### Admin Dashboard
- **Product Management** - Add, edit, delete products with image upload
- **Order Management** - View and update order status and tracking
- **User Management** - Manage customer accounts and permissions
- **Analytics** - Sales reporting and business insights
- **Activity Logging** - Track all admin actions for security

### Technical Features
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Database** - SQLite with Prisma ORM for development
- **File Uploads** - Secure image upload and storage
- **Search & Filtering** - Advanced product search capabilities
- **SEO Optimized** - Next.js App Router with metadata API

## 🛠️ Tech Stack

- **Frontend**: Next.js 14.2.3, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Payments**: Stripe Integration
- **Authentication**: NextAuth.js
- **Email**: SMTP with Nodemailer
- **Deployment**: Vercel Ready

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/sp23bcs014/professional-ecommerce-platform.git
cd professional-ecommerce-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🇵🇰 Perfect for Pakistani Developers

This platform is specifically designed to work perfectly in Pakistan:
- **No Stripe Live Keys Required** - Uses test keys for demonstration
- **Local Database** - SQLite works without external database services
- **Gmail Integration** - Uses standard Gmail SMTP (works globally)
- **Complete Demo** - Fully functional for client presentations
- **Export Ready** - Easy to adapt for international clients later

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Authentication secret key
- `NEXTAUTH_URL` - Application URL
- `STRIPE_SECRET_KEY` - Stripe payment processing
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `SMTP_HOST` - Email server configuration
- `SMTP_PORT` - Email server port
- `SMTP_USER` - Email username
- `SMTP_PASS` - Email password

## 🚀 Deployment

This application is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy with automatic builds on push

## 📊 Admin Access

Default admin credentials (change immediately):
- Email: admin@example.com
- Password: admin123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is available for commercial use. Perfect for client projects and portfolio demonstrations.

## 💼 Professional Services

This platform represents professional-grade e-commerce development suitable for:
- Small to medium businesses
- Startup e-commerce ventures
- Portfolio demonstrations
- Client project foundations

**Estimated Project Value**: $1,200 - $1,800 USD

---

Built with ❤️ using Next.js and modern web technologies.
