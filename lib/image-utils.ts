/**
 * Get a placeholder image URL based on category
 * This provides a fallback when category images don't exist yet
 */
export function getPlaceholderImage(category: string): string {
  const categoryColors: Record<string, string> = {
    'Produce': '90EE90',
    'Dairy & Eggs': 'FFE4B5',
    'Meat & Protein': 'FF6B6B',
    'Bakery': 'DEB887',
    'Pantry': 'DDA0DD',
    'Snacks': 'FFA500',
    'Beverages': '87CEEB',
    'Frozen': 'B0E0E6',
  }
  const color = categoryColors[category] || 'CCCCCC'
  const categoryText = category.replace(' & ', '+').replace(' ', '+')
  return `https://via.placeholder.com/400x400/${color}/000000?text=${encodeURIComponent(categoryText)}`
}

/**
 * Get the image URL for a product, with fallback to placeholder
 * If imageUrl is a local category image path, we'll try it but fallback to placeholder on error
 */
export function getProductImageUrl(imageUrl: string | null | undefined, category: string): string {
  // If no imageUrl, use placeholder
  if (!imageUrl) {
    return getPlaceholderImage(category)
  }
  
  // If it's a local category image path, return it (will fallback on error via onError handler)
  // Otherwise return the imageUrl as-is
  return imageUrl
}

/**
 * Check if we should use placeholder instead of trying to load local image
 * This helps avoid 404s when category images don't exist yet
 */
export function shouldUsePlaceholder(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return true
  
  // If it's a local category image path, we'll try it but it might not exist
  // The onError handler will catch it
  return false
}
