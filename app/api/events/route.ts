import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { type, productId } = body

    if (!type) {
      return NextResponse.json({ error: 'Event type required' }, { status: 400 })
    }

    await prisma.event.create({
      data: {
        type,
        userId: session?.user?.id,
        productId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

