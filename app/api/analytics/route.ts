import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { subDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const sevenDaysAgo = subDays(now, 7)
    const thirtyDaysAgo = subDays(now, 30)
    const lastWeekSameDay = subDays(now, 7)
    const lastWeekStart = startOfDay(lastWeekSameDay)
    const lastWeekEnd = endOfDay(lastWeekSameDay)
    const lastMonthStart = subDays(thirtyDaysAgo, 30)

    // Sales metrics
    const ordersToday = await prisma.order.findMany({
      where: {
        createdAt: { gte: todayStart },
        status: { not: 'cancelled' },
      },
    })

    // Orders from same day last week
    const ordersLastWeekSameDay = await prisma.order.findMany({
      where: {
        createdAt: { gte: lastWeekStart, lte: lastWeekEnd },
        status: { not: 'cancelled' },
      },
    })

    const ordersLast7Days = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { not: 'cancelled' },
      },
    })

    const ordersLast30Days = await prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { not: 'cancelled' },
      },
    })

    // Last month orders
    const ordersLastMonth = await prisma.order.findMany({
      where: {
        createdAt: { gte: lastMonthStart, lt: thirtyDaysAgo },
        status: { not: 'cancelled' },
      },
    })

    const revenueToday = ordersToday.reduce((sum, o) => sum + o.total, 0)
    const revenueLastWeekSameDay = ordersLastWeekSameDay.reduce((sum, o) => sum + o.total, 0)
    const revenueLast7Days = ordersLast7Days.reduce((sum, o) => sum + o.total, 0)
    const revenueLast30Days = ordersLast30Days.reduce((sum, o) => sum + o.total, 0)
    const revenueLastMonth = ordersLastMonth.reduce((sum, o) => sum + o.total, 0)

    const aov7Days = ordersLast7Days.length > 0 ? revenueLast7Days / ordersLast7Days.length : 0
    const aov30Days = ordersLast30Days.length > 0 ? revenueLast30Days / ordersLast30Days.length : 0

    // Sales chart data (daily for last 30 days)
    const dailySales = []
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)
      const dayOrders = await prisma.order.findMany({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
          status: { not: 'cancelled' },
        },
      })
      dailySales.push({
        date: date.toISOString().split('T')[0],
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      })
    }

    // Top products by revenue
    const topProductsByRevenue = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { not: 'cancelled' },
        },
      },
      _sum: {
        priceAtPurchase: true,
        qty: true,
      },
      orderBy: {
        _sum: {
          priceAtPurchase: 'desc',
        },
      },
      take: 10,
    })

    const topProductsByRevenueWithDetails = await Promise.all(
      topProductsByRevenue.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        })
        return {
          product,
          revenue: item._sum.priceAtPurchase || 0,
          unitsSold: item._sum.qty || 0,
        }
      })
    )

    // Top products by units sold
    const topProductsByUnits = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { not: 'cancelled' },
        },
      },
      _sum: {
        qty: true,
        priceAtPurchase: true,
      },
      orderBy: {
        _sum: {
          qty: 'desc',
        },
      },
      take: 10,
    })

    const topProductsByUnitsWithDetails = await Promise.all(
      topProductsByUnits.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        })
        return {
          product,
          unitsSold: item._sum.qty || 0,
          revenue: item._sum.priceAtPurchase || 0,
        }
      })
    )

    // Products with high views but low purchases
    const productViews = await prisma.event.groupBy({
      by: ['productId'],
      where: {
        type: 'product_view',
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: {
        id: true,
      },
    })

    const productPurchases = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { not: 'cancelled' },
        },
      },
      _sum: {
        qty: true,
      },
    })

    const viewMap = new Map(productViews.map(v => [v.productId, v._count.id]))
    const purchaseMap = new Map(productPurchases.map(p => [p.productId, p._sum.qty || 0]))

    const highViewLowPurchase = []
    for (const [productId, views] of viewMap.entries()) {
      const purchases = purchaseMap.get(productId) || 0
      if (views > 10 && purchases < views * 0.1) {
        const product = await prisma.product.findUnique({ where: { id: productId } })
        if (product) {
          highViewLowPurchase.push({
            product,
            views,
            purchases,
            conversionRate: (purchases / views) * 100,
          })
        }
      }
    }

    // Category breakdown
    const categoryRevenue = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { not: 'cancelled' },
        },
      },
      _sum: {
        priceAtPurchase: true,
      },
    })

    const categoryMap = new Map<string, number>()
    for (const item of categoryRevenue) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (product) {
        const current = categoryMap.get(product.category) || 0
        categoryMap.set(product.category, current + (item._sum.priceAtPurchase || 0))
      }
    }

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, revenue]) => ({
      category,
      revenue,
    })).sort((a, b) => b.revenue - a.revenue)

    // Customer metrics
    const totalCustomers = await prisma.user.count({
      where: { role: 'customer' },
    })

    const customersWithOrders = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { not: 'cancelled' },
      },
    })

    const newCustomers = await prisma.user.count({
      where: {
        role: 'customer',
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    const returningCustomers = customersWithOrders.filter((_, i, arr) => {
      const userId = arr[i].userId
      return arr.filter(o => o.userId === userId).length > 1
    }).length

    const repeatPurchaseRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0

    // Top customers by spend
    const customerSpend = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { not: 'cancelled' },
      },
      _sum: {
        total: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: 10,
    })

    const topCustomers = await Promise.all(
      customerSpend.map(async (item) => {
        const user = await prisma.user.findUnique({
          where: { id: item.userId },
          select: { name: true, email: true },
        })
        return {
          user,
          totalSpend: item._sum.total || 0,
        }
      })
    )

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { not: 'cancelled' },
      },
      _count: {
        id: true,
      },
    })

    const ordersByStatusFormatted = ordersByStatus.map(item => ({
      status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      count: item._count.id,
    }))

    // Inventory metrics
    // Get all products and filter for low stock
    const allProducts = await prisma.product.findMany()
    const lowStockProducts = allProducts.filter(
      product => product.stockQty <= product.lowStockThreshold
    )

    // Restock suggestions
    const restockSuggestions = []
    const fourteenDaysAgo = subDays(now, 14)
    for (const product of lowStockProducts) {
      const recentSales = await prisma.orderItem.aggregate({
        where: {
          productId: product.id,
          order: {
            createdAt: { gte: fourteenDaysAgo },
            status: { not: 'cancelled' },
          },
        },
        _sum: {
          qty: true,
        },
      })

      const soldUnits = recentSales._sum.qty || 0
      if (soldUnits > 0) {
        restockSuggestions.push({
          product,
          currentStock: product.stockQty,
          soldLast14Days: soldUnits,
          suggestedRestock: Math.max(soldUnits * 2, product.lowStockThreshold * 2),
        })
      }
    }

    return NextResponse.json({
      sales: {
        revenueToday,
        revenueLast7Days,
        revenueLast30Days,
        revenueLastMonth,
        revenueLastWeekSameDay,
        ordersToday: ordersToday.length,
        ordersLast7Days: ordersLast7Days.length,
        ordersLast30Days: ordersLast30Days.length,
        ordersLastWeekSameDay: ordersLastWeekSameDay.length,
        ordersLastMonth: ordersLastMonth.length,
        aov7Days,
        aov30Days,
        dailySales,
      },
      products: {
        topByRevenue: topProductsByRevenueWithDetails,
        topByUnits: topProductsByUnitsWithDetails,
        highViewLowPurchase,
        categoryBreakdown,
      },
      customers: {
        total: totalCustomers,
        new: newCustomers,
        returning: returningCustomers,
        repeatPurchaseRate,
        topBySpend: topCustomers,
      },
      inventory: {
        lowStock: lowStockProducts,
        restockSuggestions,
      },
      ordersByStatus: ordersByStatusFormatted,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

