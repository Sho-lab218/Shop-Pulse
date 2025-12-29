/**
 * Get the category image path for a product
 * This matches the logic in prisma/seed.ts
 */
export function getCategoryImagePath(category: string): string {
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

