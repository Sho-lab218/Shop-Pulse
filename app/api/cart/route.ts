import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Simple in-memory cart (in production, use Redis or database)
// For now, we'll use cookies or session storage on client side
// This API is just for tracking add-to-cart events

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Track add to cart event
    const { prisma } = await import('@/lib/prisma')
    await prisma.event.create({
      data: {
        type: 'add_to_cart',
        userId: session?.user?.id,
        productId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

