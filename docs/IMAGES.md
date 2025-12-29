# Product Images Guide

This project uses **category-based images** - only 8 images needed instead of 80 individual product images!

## How It Works

All products in the same category share one image. For example:
- All "Produce" items use `produce.jpg`
- All "Dairy & Eggs" items use `dairy-eggs.jpg`
- And so on...

## Setup Category Images

### Step 1: Download Images

Download 8 category images from free stock photo sites like [Unsplash](https://unsplash.com) or [Pexels](https://pexels.com):

| Category | Search Terms | Filename |
|----------|-------------|----------|
| Produce | "fresh fruits vegetables" | `produce.jpg` |
| Dairy & Eggs | "milk cheese eggs dairy" | `dairy-eggs.jpg` |
| Meat & Protein | "fresh meat fish protein" | `meat-protein.jpg` |
| Bakery | "fresh bread pastries bakery" | `bakery.jpg` |
| Pantry | "pantry staples rice pasta" | `pantry.jpg` |
| Snacks | "snacks chips cookies" | `snacks.jpg` |
| Beverages | "drinks beverages juice" | `beverages.jpg` |
| Frozen | "frozen foods freezer" | `frozen.jpg` |

### Step 2: Place Images

Save all 8 images to:
```
public/images/categories/
```

### Step 3: Reseed Database (Optional)

If you've already seeded the database, update product images:

```bash
npm run db:update-images
```

Or reseed completely:

```bash
rm prisma/dev.db
npx prisma db push
npm run db:seed
```

## Image Requirements

- **Size**: 800x800px or larger (square recommended)
- **Format**: JPG or PNG
- **File size**: Keep under 200KB for fast loading
- **Style**: Consistent lighting/background looks professional

## Placeholder Images

Until you add category images, products will automatically show colored placeholder images based on their category. This works out of the box - no setup needed!

## Alternative: Individual Product Images

If you prefer individual images for each product:

1. Place images in `public/images/products/`
2. Name them to match product names (e.g., `bananas.jpg`, `whole-milk.jpg`)
3. Update `prisma/seed.ts` to use individual image paths instead of category paths

See `prisma/seed.ts` for implementation details.

