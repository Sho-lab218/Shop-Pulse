import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCategoryImagePath } from '@/lib/category-utils'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: any = {}
    if (category) where.category = category
    if (search) {
      // SQLite doesn't support case-insensitive mode, so we'll use contains
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    const orderBy: any = {}
    if (sort === 'price-low') orderBy.price = 'asc'
    else if (sort === 'price-high') orderBy.price = 'desc'
    else if (sort === 'newest') orderBy.createdAt = 'desc'
    else orderBy.createdAt = 'desc'

    const products = await prisma.product.findMany({
      where,
      orderBy,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, category, stockQty, lowStockThreshold } = body

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Automatically set imageUrl based on category
    const imageUrl = getCategoryImagePath(category)

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl,
        stockQty: stockQty ? parseInt(stockQty) : 0,
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 10,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

