'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  stockQty: number
  lowStockThreshold: number
}

interface RestockSuggestion {
  product: Product
  currentStock: number
  soldLast14Days: number
  suggestedRestock: number
}

export default function InventoryPage() {
  const router = useRouter()
  const [lowStock, setLowStock] = useState<Product[]>([])
  const [restockSuggestions, setRestockSuggestions] = useState<RestockSuggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        setLowStock(data.inventory.lowStock)
        setRestockSuggestions(data.inventory.restockSuggestions)
        setLoading(false)
      })
  }, [])

  const updateStock = async (productId: string, newStock: number) => {
    const product = lowStock.find(p => p.id === productId)
    if (!product) return

    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockQty: newStock }),
    })

    if (res.ok) {
      // Reload data
      fetch('/api/analytics')
        .then(res => res.json())
        .then(data => {
          setLowStock(data.inventory.lowStock)
          setRestockSuggestions(data.inventory.restockSuggestions)
        })
    } else {
      alert('Failed to update stock')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Inventory Manager</h1>

      <div className="space-y-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-gray-900">No low stock items</p>
          ) : (
            <div className="space-y-4">
              {lowStock.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-gray-900">
                      Current: {product.stockQty} | Threshold: {product.lowStockThreshold}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      defaultValue={product.stockQty}
                      onBlur={(e) => {
                        const newStock = parseInt(e.target.value) || 0
                        if (newStock !== product.stockQty) {
                          updateStock(product.id, newStock)
                        }
                      }}
                      className="w-20 px-3 py-2 border border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">units</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Restock Suggestions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Restock Suggestions</h2>
          </div>
          {restockSuggestions.length === 0 ? (
            <p className="text-gray-900">No restock suggestions at this time</p>
          ) : (
            <div className="space-y-4">
              {restockSuggestions.map((suggestion, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{suggestion.product.name}</p>
                      <p className="text-sm text-gray-900">
                        Current stock: {suggestion.currentStock} | 
                        Sold last 14 days: {suggestion.soldLast14Days} | 
                        Suggested restock: {suggestion.suggestedRestock}
                      </p>
                    </div>
                    <button
                      onClick={() => updateStock(suggestion.product.id, suggestion.suggestedRestock)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

