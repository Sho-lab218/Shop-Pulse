'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AnalyticsData {
  sales: {
    revenueToday: number
    revenueLast7Days: number
    revenueLast30Days: number
    ordersToday: number
    ordersLast7Days: number
    ordersLast30Days: number
    aov7Days: number
    aov30Days: number
    dailySales: Array<{ date: string; revenue: number; orders: number }>
  }
  products: {
    topByRevenue: Array<{ product: any; revenue: number; unitsSold: number }>
    topByUnits: Array<{ product: any; unitsSold: number; revenue: number }>
    highViewLowPurchase: Array<{ product: any; views: number; purchases: number; conversionRate: number }>
    categoryBreakdown: Array<{ category: string; revenue: number }>
  }
  customers: {
    total: number
    new: number
    returning: number
    repeatPurchaseRate: number
    topBySpend: Array<{ user: any; totalSpend: number }>
  }
  inventory: {
    lowStock: any[]
    restockSuggestions: any[]
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-900">No data available</div>
  }

  // Calculate total for percentage display
  const categoryTotal = data.products.categoryBreakdown.reduce((sum, item) => sum + item.revenue, 0)

  // Custom tooltip formatter for currency
  const currencyFormatter = (value: number) => `$${value.toFixed(2)}`
  
  // Custom label formatter for pie chart
  const renderCustomLabel = (entry: any) => {
    const percent = categoryTotal > 0 ? ((entry.value / categoryTotal) * 100).toFixed(1) : 0
    return `${percent}%`
  }

  // Format dates for better display
  const formattedDailySales = data.sales.dailySales.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: d.revenue,
    orders: d.orders,
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="text-sm text-gray-900">{new Date().toLocaleTimeString()}</div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Revenue Today</h3>
          <p className="text-2xl font-bold text-gray-900">${data.sales.revenueToday.toFixed(2)}</p>
          <p className="text-sm text-gray-900 mt-1">
            {data.sales.ordersToday} orders
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Revenue (7 days)</h3>
          <p className="text-2xl font-bold text-gray-900">${data.sales.revenueLast7Days.toFixed(2)}</p>
          <p className="text-sm text-gray-900 mt-1">
            {data.sales.ordersLast7Days} orders
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Revenue (30 days)</h3>
          <p className="text-2xl font-bold text-gray-900">${data.sales.revenueLast30Days.toFixed(2)}</p>
          <p className="text-sm text-gray-900 mt-1">
            {data.sales.ordersLast30Days} orders
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Avg. Order Value</h3>
          <p className="text-2xl font-bold text-gray-900">${data.sales.aov30Days.toFixed(2)}</p>
          <p className="text-sm text-gray-900 mt-1">
            Last 30 days
          </p>
        </div>
      </div>

      {/* Sales Trends Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Sales Trends (Last 30 Days)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedDailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" stroke="#6b7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `$${value.toFixed(2)}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Legend wrapperStyle={{ color: '#374151', fontSize: '14px' }} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                name="Revenue"
                strokeWidth={2}
                dot={false}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="orders" 
                stroke="#82ca9d" 
                name="Orders"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Top Products by Revenue</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.products.topByRevenue.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="product.name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  stroke="#6b7280"
                  fontSize={11}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={currencyFormatter}
                />
                <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Category Breakdown</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={data.products.categoryBreakdown}
                  dataKey="revenue"
                  nameKey="category"
                  cx="40%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={0}
                  paddingAngle={2}
                  label={false}
                >
                  {data.products.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151', padding: '12px' }}
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)} (${((value / categoryTotal) * 100).toFixed(1)}%)`,
                    name
                  ]}
                />
                <Legend 
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  wrapperStyle={{ 
                    color: '#374151', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    paddingLeft: '20px',
                    lineHeight: '1.8'
                  }}
                  formatter={(value) => {
                    const item = data.products.categoryBreakdown.find(c => c.category === value)
                    const percent = item ? ((item.revenue / categoryTotal) * 100).toFixed(1) : '0'
                    return `${value}: ${percent}%`
                  }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Customer Insights</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900 font-medium">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.customers.total}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900 font-medium">New (30 days)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.customers.new}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900 font-medium">Returning</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.customers.returning}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900 font-medium">Repeat Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.customers.repeatPurchaseRate.toFixed(1)}%</p>
            </div>
          </div>
          {data.customers.topBySpend.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Top Customers by Spend</h3>
              <div className="space-y-2">
                {data.customers.topBySpend.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded border border-gray-200">
                    <span className="text-gray-900 font-medium">{item.user?.name || item.user?.email || 'Unknown'}</span>
                    <span className="font-semibold text-gray-900">${item.totalSpend.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Products by Units Sold */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Top Products by Units Sold</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.products.topByUnits.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="product.name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  stroke="#6b7280"
                  fontSize={11}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="unitsSold" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High View Low Purchase */}
      {data.products.highViewLowPurchase.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Products with High Views but Low Purchases</h2>
          <div className="space-y-3">
            {data.products.highViewLowPurchase.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div>
                  <p className="font-semibold text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-900 mt-1">
                    Views: {item.views} | Purchases: {item.purchases} | Conversion: {item.conversionRate.toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${item.product.price?.toFixed(2) || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Low Stock Alerts</h2>
          {data.inventory.lowStock.length === 0 ? (
            <p className="text-gray-900">No low stock items</p>
          ) : (
            <div className="space-y-2">
              {data.inventory.lowStock.slice(0, 5).map((product, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded">
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-900">
                      Stock: {product.stockQty} | Threshold: {product.lowStockThreshold}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Restock Suggestions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Restock Suggestions</h2>
          {data.inventory.restockSuggestions.length === 0 ? (
            <p className="text-gray-900">No restock suggestions at this time</p>
          ) : (
            <div className="space-y-2">
              {data.inventory.restockSuggestions.slice(0, 5).map((suggestion, idx) => (
                <div key={idx} className="p-3 border border-blue-200 rounded bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{suggestion.product.name}</p>
                      <p className="text-sm text-gray-900 mt-1">
                        Current: {suggestion.currentStock} | Sold (14d): {suggestion.soldLast14Days} | Suggested: {suggestion.suggestedRestock}
                      </p>
                    </div>
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
