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

    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let where: any = {}

    if (eventId || status) {
      where.eventResponses = {
        some: {},
      }
      if (eventId) {
        where.eventResponses.some.eventId = eventId
      }
      if (status) {
        where.eventResponses.some.status = status
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const rsvps = await prisma.rsvp.findMany({
      where,
      include: {
        inviteLinkConfig: {
          select: {
            slug: true,
            label: true,
          },
        },
        eventResponses: {
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(rsvps)
  } catch (error) {
    console.error('Error fetching RSVPs:', error)
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
    const {
      id,
      name,
      phone,
      email,
      side,
      plusOne,
      plusOneName,
      plusOneRelation,
      dietaryRequirements,
      notes,
      eventResponses,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'RSVP ID required' }, { status: 400 })
    }

    // Update RSVP
    const rsvp = await prisma.rsvp.update({
      where: { id },
      data: {
        name,
        phone,
        email: email || null,
        side,
        plusOne: plusOne || false,
        plusOneName: plusOne ? plusOneName || null : null,
        plusOneRelation: plusOne ? plusOneRelation || null : null,
        dietaryRequirements: dietaryRequirements || null,
        notes: notes || null,
      },
    })

    // Update event responses
    if (eventResponses) {
      // Delete existing responses
      await prisma.rsvpEventResponse.deleteMany({
        where: { rsvpId: rsvp.id },
      })

      // Create new responses
      await prisma.rsvpEventResponse.createMany({
        data: Object.entries(eventResponses).map(([eventId, status]) => ({
          rsvpId: rsvp.id,
          eventId,
          status: status as string,
        })),
      })
    }

    const updatedRsvp = await prisma.rsvp.findUnique({
      where: { id: rsvp.id },
      include: {
        inviteLinkConfig: {
          select: {
            slug: true,
            label: true,
          },
        },
        eventResponses: {
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

    return NextResponse.json(updatedRsvp)
  } catch (error) {
    console.error('Error updating RSVP:', error)
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

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'RSVP ID required' }, { status: 400 })
    }

    // Delete event responses first (cascade)
    await prisma.rsvpEventResponse.deleteMany({
      where: { rsvpId: id },
    })

    // Delete RSVP
    await prisma.rsvp.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting RSVP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

