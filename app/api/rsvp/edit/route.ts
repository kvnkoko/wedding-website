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
        plusOne: er.plusOne || false,
        plusOneName: er.plusOneName || null,
        plusOneRelation: er.plusOneRelation || null,
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

    // Determine if there's any plus one (for backward compatibility)
    const hasAnyPlusOne = Object.values(eventResponses || {}).some((response: any) => 
      typeof response === 'object' && response?.plusOne === true
    )

    // Update RSVP
    const rsvp = await prisma.rsvp.update({
      where: { editToken },
      data: {
        name,
        phone,
        email: email || null,
        side,
        plusOne: hasAnyPlusOne, // Keep for backward compatibility
        plusOneName: null, // No longer used at RSVP level
        plusOneRelation: null, // No longer used at RSVP level
        dietaryRequirements: dietaryRequirements || null,
        notes: notes || null,
      },
    })

    // Check if migration has been applied
    let useNewSchema = false
    try {
      await prisma.$queryRaw`SELECT "plus_one" FROM "rsvp_event_responses" LIMIT 0`
      useNewSchema = true
    } catch {
      useNewSchema = false
    }

    // Update event responses
    if (eventResponses) {
      // Delete existing responses
      await prisma.rsvpEventResponse.deleteMany({
        where: { rsvpId: rsvp.id },
      })

      // Prepare event responses data
      const eventResponsesData = Object.entries(eventResponses).map(([eventId, response]) => {
        // Handle both old format (string) and new format (object)
        const responseData = typeof response === 'string' 
          ? { status: response, plusOne: false, plusOneName: null, plusOneRelation: null }
          : response as any
        
        // Only include plus one fields if migration has been applied
        if (useNewSchema) {
          return {
            rsvpId: rsvp.id,
            eventId,
            status: responseData.status,
            plusOne: responseData.plusOne || false,
            plusOneName: responseData.plusOne ? (responseData.plusOneName || null) : null,
            plusOneRelation: responseData.plusOne ? (responseData.plusOneRelation || null) : null,
          }
        } else {
          return {
            rsvpId: rsvp.id,
            eventId,
            status: responseData.status,
          }
        }
      })

      // Create new responses - try with new schema, fallback to old if it fails
      try {
        await prisma.rsvpEventResponse.createMany({
          data: eventResponsesData,
        })
      } catch (createError: any) {
        // If creation fails and we were using new schema, try again without plusOne fields
        const errorMsg = createError?.message || String(createError)
        if (useNewSchema && (errorMsg.includes('column') || errorMsg.includes('plus_one') || errorMsg.includes('does not exist'))) {
          console.log('Retrying event responses creation without plusOne fields')
          const oldSchemaData = Object.entries(eventResponses).map(([eventId, response]) => {
            const responseData = typeof response === 'string' ? response : (response as any).status
            return {
              rsvpId: rsvp.id,
              eventId,
              status: responseData,
            }
          })
          await prisma.rsvpEventResponse.createMany({
            data: oldSchemaData,
          })
        } else {
          throw createError
        }
      }
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
        plusOne: er.plusOne || false,
        plusOneName: er.plusOneName || null,
        plusOneRelation: er.plusOneRelation || null,
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

