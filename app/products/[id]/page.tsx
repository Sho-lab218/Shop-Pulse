'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ShoppingCart } from 'lucide-react'
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

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/products/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data)
          setLoading(false)
        })
    }
  }, [params.id])

  const addToCart = async () => {
    if (!product) return

    setAdding(true)
    try {
      // Track add to cart event
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })

      // Add to local storage cart
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existingItem = cart.find((item: any) => item.productId === product.id)

      if (existingItem) {
        existingItem.qty += quantity
      } else {
        cart.push({
          productId: product.id,
          qty: quantity,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
        })
      }

      localStorage.setItem('cart', JSON.stringify(cart))
      router.push('/cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-center">Loading...</div>
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-center">Product not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <div className="w-full h-96 bg-gray-200 rounded-lg relative">
            <ProductImage
              imageUrl={product.imageUrl}
              category={product.category}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-900 mb-4">{product.category}</p>
          <p className="text-3xl font-bold text-blue-600 mb-4">
            ${product.price.toFixed(2)}
          </p>

          <div className="mb-6">
            <p className="text-gray-900 whitespace-pre-line">
              {product.description || 'No description available.'}
            </p>
          </div>

          <div className="mb-6">
            {product.stockQty > 0 ? (
              <span className="text-green-600 font-semibold">
                In Stock ({product.stockQty} available)
              </span>
            ) : (
              <span className="text-red-600 font-semibold">Out of Stock</span>
            )}
          </div>

          {product.stockQty > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stockQty}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQty, parseInt(e.target.value) || 1)))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={addToCart}
                disabled={adding}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5" />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

