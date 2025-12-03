import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      orderBy: { dateTime: 'asc' },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { name, slug, dateTime, venueName, city, capacity } = body

    if (!name || !slug || !dateTime || !venueName || !city || !capacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        name,
        slug,
        dateTime: new Date(dateTime),
        venueName,
        city,
        capacity: parseInt(capacity),
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { id, name, slug, dateTime, venueName, city, capacity } = body

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        name,
        slug,
        dateTime: new Date(dateTime),
        venueName,
        city,
        capacity: parseInt(capacity),
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

