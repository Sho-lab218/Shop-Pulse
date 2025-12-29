'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, User } from 'lucide-react'

interface OrderItem {
  id: string
  qty: number
  priceAtPurchase: number
  product: {
    name: string
  }
}

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
  }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    if (res.ok) {
      const updatedOrder = await res.json()
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
    } else {
      alert('Failed to update order status')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

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
    <div>
      <h1 className="text-3xl font-bold mb-6">Order Manager</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map(order => (
              <tr key={order.id}>
                <td className="px-6 py-4 font-mono text-sm">#{order.id.slice(0, 8)}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-sm text-gray-900">{order.user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-semibold">${order.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

