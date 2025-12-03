import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(photos)
  } catch (error: any) {
    console.error('Error fetching photos:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url, alt } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Get the highest order number and add 1
    let newOrder = 0
    try {
      const lastPhoto = await prisma.photo.findFirst({
        orderBy: { order: 'desc' },
      })
      newOrder = lastPhoto ? lastPhoto.order + 1 : 0
    } catch (orderError: any) {
      console.warn('Error getting last photo order, using 0:', orderError)
      newOrder = 0
    }

    const photo = await prisma.photo.create({
      data: {
        url,
        alt: alt || null,
        order: newOrder,
      },
    })

    return NextResponse.json(photo)
  } catch (error: any) {
    console.error('Error creating photo:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    })
    
    // Check if it's a Prisma schema issue
    if (error?.message?.includes('Unknown model') || error?.code === 'P2001') {
      return NextResponse.json(
        { 
          error: 'Photo model not found. Please run database migrations.',
          needsMigration: true
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { photos } = body // Array of { id, order } objects

    if (!Array.isArray(photos)) {
      return NextResponse.json(
        { error: 'Photos array is required' },
        { status: 400 }
      )
    }

    // Update all photos in a transaction
    await prisma.$transaction(
      photos.map((p: { id: string; order: number }) =>
        prisma.photo.update({
          where: { id: p.id },
          data: { order: p.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating photo order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    await prisma.photo.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

