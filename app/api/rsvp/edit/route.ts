import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const editToken = searchParams.get('token')

    if (!editToken) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const rsvp = await prisma.rsvp.findUnique({
      where: { editToken },
      include: {
        inviteLinkConfig: {
          include: {
            events: {
              include: {
                event: true,
              },
            },
          },
        },
        eventResponses: {
          include: {
            event: true,
          },
        },
      },
    })

    if (!rsvp) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    return NextResponse.json({
      rsvp: {
        id: rsvp.id,
        name: rsvp.name,
        phone: rsvp.phone,
        email: rsvp.email,
        side: rsvp.side,
        plusOne: rsvp.plusOne,
        plusOneName: rsvp.plusOneName,
        plusOneRelation: rsvp.plusOneRelation,
        dietaryRequirements: rsvp.dietaryRequirements,
        notes: rsvp.notes,
      },
      config: {
        id: rsvp.inviteLinkConfig.id,
        slug: rsvp.inviteLinkConfig.slug,
        events: rsvp.inviteLinkConfig.events.map((e) => ({
          id: e.event.id,
          name: e.event.name,
          dateTime: e.event.dateTime.toISOString(),
          venueName: e.event.venueName,
          city: e.event.city,
        })),
      },
      eventResponses: rsvp.eventResponses.map((er) => ({
        eventId: er.eventId,
        status: er.status,
      })),
    })
  } catch (error) {
    console.error('Error fetching RSVP for edit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      editToken,
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

    if (!editToken) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const existingRsvp = await prisma.rsvp.findUnique({
      where: { editToken },
      include: {
        inviteLinkConfig: {
          include: {
            events: {
              include: {
                event: true,
              },
            },
          },
        },
      },
    })

    if (!existingRsvp) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    // Update RSVP
    const rsvp = await prisma.rsvp.update({
      where: { editToken },
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
        eventResponses: {
          include: {
            event: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: updatedRsvp!.id,
      name: updatedRsvp!.name,
      phone: updatedRsvp!.phone,
      email: updatedRsvp!.email,
      side: updatedRsvp!.side,
      plusOne: updatedRsvp!.plusOne,
      plusOneName: updatedRsvp!.plusOneName,
      plusOneRelation: updatedRsvp!.plusOneRelation,
      dietaryRequirements: updatedRsvp!.dietaryRequirements,
      notes: updatedRsvp!.notes,
      eventResponses: updatedRsvp!.eventResponses.map((er) => ({
        eventId: er.eventId,
        eventName: er.event.name,
        status: er.status,
      })),
    })
  } catch (error) {
    console.error('Error updating RSVP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

