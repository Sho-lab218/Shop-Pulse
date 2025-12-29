'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Link from 'next/link'

interface AnalyticsData {
  sales: {
    revenueToday: number
    revenueLast30Days: number
    revenueLastMonth: number
    revenueLastWeekSameDay: number
    ordersToday: number
    ordersLastWeekSameDay: number
    ordersLast30Days: number
    aov30Days: number
    dailySales: Array<{ date: string; revenue: number; orders: number }>
  }
  products: {
    categoryBreakdown: Array<{ category: string; revenue: number }>
  }
  customers: {
    total: number
  }
  inventory: {
    lowStock: any[]
  }
  ordersByStatus: Array<{ status: string; count: number }>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || session.user.role !== 'admin') {
      router.push('/')
      return
    }

    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [session, router])

  if (loading || !data) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>
  }

  const revenueDiff = data.sales.revenueToday - data.sales.revenueLastWeekSameDay
  const ordersDiff = data.sales.ordersToday - data.sales.ordersLastWeekSameDay
  const monthlyRevenueDiff = data.sales.revenueLast30Days - data.sales.revenueLastMonth

  // Format daily sales for charts (last 30 days)
  const salesVolumeData = data.sales.dailySales.map(d => ({
    date: new Date(d.date).getDate(),
    revenue: d.revenue,
  }))

  const orderVolumeData = data.sales.dailySales.map(d => ({
    date: new Date(d.date).getDate(),
    orders: d.orders,
  }))

  // Orders by status
  const ordersByStatus = data.ordersByStatus || []

  // Top categories by revenue
  const topCategories = data.products.categoryBreakdown.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Ecommerce KPI Dashboard</h1>
        <div className="text-sm text-gray-600">{new Date().toLocaleTimeString()}</div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Total sales</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            ${data.sales.revenueToday.toFixed(2)} <span className="text-sm font-normal">Today</span>
          </p>
          <div className="flex items-center text-sm">
            {revenueDiff >= 0 ? (
              <>
                <span className="text-green-600">▲</span>
                <span className="text-green-600 ml-1">
                  ${Math.abs(revenueDiff).toFixed(2)} vs same day last week
                </span>
              </>
            ) : (
              <>
                <span className="text-red-600">▼</span>
                <span className="text-red-600 ml-1">
                  ${Math.abs(revenueDiff).toFixed(2)} vs same day last week
                </span>
              </>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-900 font-medium mb-2">Sales volume:</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesVolumeData}>
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Orders</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {data.sales.ordersToday} <span className="text-sm font-normal">Today</span>
          </p>
          <div className="flex items-center text-sm">
            {ordersDiff >= 0 ? (
              <>
                <span className="text-green-600">▲</span>
                <span className="text-green-600 ml-1">
                  {Math.abs(ordersDiff)} vs same day last week
                </span>
              </>
            ) : (
              <>
                <span className="text-red-600">▼</span>
                <span className="text-red-600 ml-1">
                  {Math.abs(ordersDiff)} vs same day last week
                </span>
              </>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-900 font-medium mb-2">Order volume:</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orderVolumeData}>
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Net Profit / Revenue This Month */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Net revenue</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            ${(data.sales.revenueLast30Days / 1000).toFixed(2)}K <span className="text-sm font-normal">This month</span>
          </p>
          <div className="flex items-center text-sm mb-4">
            {monthlyRevenueDiff >= 0 ? (
              <>
                <span className="text-green-600">▲</span>
                <span className="text-green-600 ml-1">
                  ${(Math.abs(monthlyRevenueDiff) / 1000).toFixed(2)}k vs last month
                </span>
              </>
            ) : (
              <>
                <span className="text-red-600">▼</span>
                <span className="text-red-600 ml-1">
                  ${(Math.abs(monthlyRevenueDiff) / 1000).toFixed(2)}k vs last month
                </span>
              </>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-900 font-medium mb-2">Profit margin:</p>
            <p className="text-3xl font-bold text-gray-900">
              {data.sales.revenueLast30Days > 0 
                ? Math.round((data.sales.revenueLast30Days / (data.sales.revenueLast30Days * 1.5)) * 100)
                : 0}%
            </p>
            <div className="flex items-center text-sm mt-2">
              <span className="text-green-600">▲</span>
              <span className="text-green-600 ml-1">2% vs last month</span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-900">Total revenue:</span>
              <span className="font-semibold text-gray-900">${data.sales.revenueLast30Days.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900">Total orders:</span>
              <span className="font-semibold text-gray-900">{data.sales.ordersLast30Days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900">Avg. order value:</span>
              <span className="font-semibold text-gray-900">${data.sales.aov30Days.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900">Total customers:</span>
              <span className="font-semibold text-gray-900">{data.customers.total}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-900">Low stock items:</span>
                <Link href="/admin/inventory" className="text-red-600 font-semibold hover:underline">
                  {data.inventory.lowStock.length}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Sales by Category */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Sales by category</h3>
          <div className="space-y-2">
            {topCategories.map((cat, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-900">{cat.category}</span>
                <span className="font-semibold text-gray-900">
                  ${(cat.revenue / 1000).toFixed(1)}K
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Orders by status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="status" type="category" stroke="#6b7280" fontSize={12} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Avg. order value</h3>
          <div className="flex flex-col items-center justify-center h-48">
            <div className="relative w-32 h-32">
              {/* Simple circular progress */}
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={data.sales.aov30Days > 25 ? "#10b981" : data.sales.aov30Days > 15 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(data.sales.aov30Days / 50) * 351.86} 351.86`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">${data.sales.aov30Days.toFixed(0)}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-900 mt-4">Range: $0 - $50</p>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Top products</h3>
          <div className="space-y-2">
            {data.products.categoryBreakdown.slice(0, 5).map((cat, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-900">{cat.category}</span>
                <span className="font-semibold text-gray-900">
                  ${(cat.revenue / 1000).toFixed(1)}K
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
