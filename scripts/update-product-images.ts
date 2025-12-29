/**
 * Script to update all existing products with category-based image URLs
 * Run with: npx tsx scripts/update-product-images.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to get category image path
const getCategoryImagePath = (category: string) => {
  const categoryMap: Record<string, string> = {
    'Produce': 'produce',
    'Dairy & Eggs': 'dairy-eggs',
    'Meat & Protein': 'meat-protein',
    'Bakery': 'bakery',
    'Pantry': 'pantry',
    'Snacks': 'snacks',
    'Beverages': 'beverages',
    'Frozen': 'frozen',
  }
  const folder = categoryMap[category] || 'default'
  return `/images/categories/${folder}.jpg`
}

async function main() {
  console.log('🖼️  Updating product images...')

  const products = await prisma.product.findMany()

  let updated = 0
  for (const product of products) {
    const imageUrl = getCategoryImagePath(product.category)
    
    // Only update if imageUrl is different or null
    if (product.imageUrl !== imageUrl) {
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl },
      })
      updated++
      console.log(`✅ Updated ${product.name} (${product.category})`)
    }
  }

  console.log(`\n✨ Updated ${updated} products with category images`)
  console.log('\n📝 Note: If category images don\'t exist yet, products will show placeholder images.')
  console.log('   Add images to: public/images/categories/')
}

main()
  .catch((e) => {
    console.error('❌ Error updating products:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

