import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const configs = await prisma.inviteLinkConfig.findMany({
      include: {
        events: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(configs)
  } catch (error) {
    console.error('Error fetching invite links:', error)
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
    const { slug, label, notes, eventIds } = body

    if (!slug || !label || !eventIds || !Array.isArray(eventIds)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const config = await prisma.inviteLinkConfig.create({
      data: {
        slug,
        label,
        notes: notes || null,
        events: {
          create: eventIds.map((eventId: string) => ({
            eventId,
          })),
        },
      },
      include: {
        events: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating invite link:', error)
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
    const { id, slug, label, notes, eventIds } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Config ID required' },
        { status: 400 }
      )
    }

    // Delete existing event associations
    await prisma.inviteLinkConfigEvent.deleteMany({
      where: { inviteLinkConfigId: id },
    })

    // Update config and create new associations
    const config = await prisma.inviteLinkConfig.update({
      where: { id },
      data: {
        slug,
        label,
        notes: notes || null,
        events: {
          create: (eventIds || []).map((eventId: string) => ({
            eventId,
          })),
        },
      },
      include: {
        events: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating invite link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

