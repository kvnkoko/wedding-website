import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateEditToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      inviteLinkConfigId,
      name,
      phone,
      email,
      side,
      dietaryRequirements,
      notes,
      eventResponses,
    } = body

    if (!inviteLinkConfigId || !name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the config exists
    const config = await prisma.inviteLinkConfig.findUnique({
      where: { id: inviteLinkConfigId },
      include: {
        events: {
          include: {
            event: true,
          },
        },
      },
    })

    if (!config) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 400 })
    }

    // Validate event responses match allowed events
    const allowedEventIds = config.events.map((e) => e.event.id)
    const responseEventIds = Object.keys(eventResponses || {})

    for (const eventId of responseEventIds) {
      if (!allowedEventIds.includes(eventId)) {
        return NextResponse.json(
          { error: 'Invalid event in response' },
          { status: 400 }
        )
      }
    }
    
    // Determine if there's any plus one (for backward compatibility)
    const hasAnyPlusOne = Object.values(eventResponses || {}).some((response: any) => 
      typeof response === 'object' && response?.plusOne === true
    )

    const editToken = generateEditToken()

    // Create RSVP
    const rsvp = await prisma.rsvp.create({
      data: {
        inviteLinkConfigId,
        name,
        phone,
        email: email || null,
        side,
        plusOne: hasAnyPlusOne, // Keep for backward compatibility
        plusOneName: null, // No longer used at RSVP level
        plusOneRelation: null, // No longer used at RSVP level
        dietaryRequirements: dietaryRequirements || null,
        notes: notes || null,
        editToken,
        eventResponses: {
          create: Object.entries(eventResponses || {}).map(([eventId, response]) => {
            // Handle both old format (string) and new format (object)
            const responseData = typeof response === 'string' 
              ? { status: response, plusOne: false, plusOneName: null, plusOneRelation: null }
              : response as any
            return {
              eventId,
              status: responseData.status,
              plusOne: responseData.plusOne || false,
              plusOneName: responseData.plusOne ? (responseData.plusOneName || null) : null,
              plusOneRelation: responseData.plusOne ? (responseData.plusOneRelation || null) : null,
            }
          }),
        },
      },
      include: {
        eventResponses: {
          include: {
            event: true,
          },
        },
      },
    })

    return NextResponse.json({
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
      editToken: rsvp.editToken,
      eventResponses: rsvp.eventResponses.map((er) => ({
        eventId: er.eventId,
        eventName: er.event.name,
        status: er.status,
        plusOne: er.plusOne || false,
        plusOneName: er.plusOneName || null,
        plusOneRelation: er.plusOneRelation || null,
      })),
    })
  } catch (error) {
    console.error('Error submitting RSVP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

