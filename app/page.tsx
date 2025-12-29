'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductImage from '@/app/components/ProductImage'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  imageUrl: string | null
  stockQty: number
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/products?sort=newest')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedProducts(data.slice(0, 8))
          const uniqueCategories = [...new Set(data.map((p: Product) => p.category))]
          setCategories(uniqueCategories)
        }
      })
      .catch(error => {
        console.error('Error loading products:', error)
      })
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Welcome to ShopPulse</h1>
        <p className="text-xl">Your local grocery shop - fresh products, delivered</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <form action="/shop" method="get" className="flex gap-2">
          <input
            type="text"
            name="search"
            placeholder="Search products..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Link
                key={category}
                href={`/shop?category=${encodeURIComponent(category)}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="w-full h-48 bg-gray-200 relative">
                <ProductImage
                  imageUrl={product.imageUrl}
                  category={product.category}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-gray-900 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.stockQty > 0 ? (
                    <span className="text-sm text-green-600">In Stock</span>
                  ) : (
                    <span className="text-sm text-red-600">Out of Stock</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  )
}

