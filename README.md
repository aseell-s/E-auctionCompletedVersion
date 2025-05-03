# E-Auction Platform

A comprehensive online auction platform built with Next.js, Prisma, and PostgreSQL.

## Features

- Role-based authentication (Buyer, Seller, Admin)
- Auction creation and management
- Real-time bidding
- Seller approval workflow
- Mobile-responsive design
- User profiles and messaging

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- pnpm (recommended) or npm

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and update the database connection string
3. Install dependencies:

```bash
pnpm install
# or
npm install
```

4. Set up the database:

```bash
pnpm db:reset
# or
npm run db:reset
```

5. Start the development server:

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Login Credentials

Use these credentials to test the application:

- **Admin**: admin@example.com / admin123
- **Seller**: john@seller.com / seller123
- **Buyer**: bob@buyer.com / buyer123

## Responsive Design

This application is fully responsive and optimized for:
- Mobile devices (320px and up)
- Tablets (768px and up)
- Desktops (1024px and up)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **UI Components**: Radix UI, shadcn/ui

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable UI components
- `/lib` - Utility functions and shared code
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/store` - Zustand state management
- `/types` - TypeScript type definitions

## License

This project is licensed under the MIT License - see the LICENSE file for details.
