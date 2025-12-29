# ShopPulse

A small grocery / specialty shop e-commerce site with analytics. Perfect for local markets like butchers, produce box shops, bakeries, ethnic groceries, or campus convenience stores.

This project models a small-market grocery workflow and intentionally excludes enterprise retail features keep scope focused on core e-commerce + decision analytics.

## Features

### Customer Features
- Browse grocery products with search and category filters
- Add items to cart
- Checkout with shipping information
- View order history
- Account management

### Admin Features
- Product management (create, edit, delete)
- Inventory management with low-stock alerts
- Order management with status updates
- Comprehensive analytics dashboard:
  - Sales metrics (revenue, orders, AOV)
  - Product performance (top sellers, category breakdown)
  - Customer insights (repeat purchase rate, top customers)
  - Inventory insights (low stock alerts, restock suggestions)
  - Conversion funnel tracking

### Product Categories
- Produce
- Dairy & Eggs
- Meat & Protein
- Bakery
- Pantry
- Snacks
- Beverages
- Frozen

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (via Prisma)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL="file:./prisma/dev.db"`
- `NEXTAUTH_SECRET` (generate a random string, e.g., run `openssl rand -base64 32`)
- `NEXTAUTH_URL="http://localhost:3000"`

3. Set up the database:
```bash
npx prisma db push
npm run db:seed
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Credentials

After seeding the database, you can login with:

**Admin:**
- Email: `admin@shoppulse.com`
- Password: `admin123`

**Customer (any of 30 seeded customers):**
- Email: `[name]@example.com` (e.g., `john.doe@example.com`, `jane.smith@example.com`)
- Password: `customer123`

## Project Structure

```
/app
  /api          # API routes
  /admin        # Admin pages
  /components   # React components
  /products     # Product pages
  /shop         # Shop listing
  /cart         # Shopping cart
  /checkout     # Checkout page
  /orders       # Order history
/lib            # Utilities and Prisma client
/prisma         # Database schema and seed script
/scripts        # Utility scripts
/public         # Static assets (images, etc.)
/docs           # Documentation
```

## Image Setup

This project uses category-based images (8 images total). See [docs/IMAGES.md](docs/IMAGES.md) for setup instructions.

## Database Schema

- **Users**: Customer and admin accounts
- **Products**: Product catalog
- **Orders**: Customer orders
- **OrderItems**: Items in each order
- **Events**: Analytics events (product views, cart additions, checkout events)

## Analytics Features

The analytics dashboard tracks:
- Sales trends over time
- Top products by revenue and units sold
- Products with high views but low conversions
- Category performance
- Customer repeat purchase rate
- Low stock alerts
- Restock suggestions based on sales velocity

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:seed` - Seed database with sample data
- `npm run db:update-images` - Update all product images based on category
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Security

- Password hashing with bcrypt
- Role-based access control
- Server-side input validation
- Protected admin routes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

# Shop-Pulse
