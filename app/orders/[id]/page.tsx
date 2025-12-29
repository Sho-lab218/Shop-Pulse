'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ProductImage from '@/app/components/ProductImage'

interface OrderItem {
  id: string
  qty: number
  priceAtPurchase: number
  product: {
    id: string
    name: string
    imageUrl: string | null
    category: string
  }
}

interface Order {
  id: string
  total: number
  status: string
  shippingInfo: string | null
  createdAt: string
  items: OrderItem[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        const foundOrder = data.find((o: Order) => o.id === params.id)
        if (!foundOrder) {
          router.push('/orders')
          return
        }
        setOrder(foundOrder)
        setLoading(false)
      })
  }, [params.id, session, router])

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-center">Loading...</div>
  }

  if (!order) {
    return null
  }

  const shippingInfo = order.shippingInfo ? JSON.parse(order.shippingInfo) : null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-900">Order ID</p>
            <p className="font-semibold">#{order.id.slice(0, 8)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-900">Status</p>
            <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-900">Order Date</p>
          <p>{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {shippingInfo && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {shippingInfo.name}</p>
            <p><span className="font-medium">Email:</span> {shippingInfo.email}</p>
            <p><span className="font-medium">Phone:</span> {shippingInfo.phone}</p>
            <p><span className="font-medium">Address:</span> {shippingInfo.address}</p>
            <p><span className="font-medium">City:</span> {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
        <div className="space-y-4 mb-4">
          {order.items.map(item => (
            <div key={item.id} className="flex gap-4 border-b pb-4">
              <div className="w-20 h-20 bg-gray-200 rounded relative flex-shrink-0">
                <ProductImage
                  imageUrl={item.product.imageUrl}
                  category={item.product.category || 'Product'}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-sm text-gray-900">Quantity: {item.qty}</p>
                <p className="text-sm text-gray-900">Price: ${item.priceAtPurchase.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  ${(item.priceAtPurchase * item.qty).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

