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

    console.log('RSVP submission received:', {
      hasInviteLinkConfigId: !!inviteLinkConfigId,
      hasName: !!name,
      hasPhone: !!phone,
      eventResponsesKeys: Object.keys(eventResponses || {}),
    })

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

    // Use old schema only (no per-event plus one fields) to ensure it works
    // This will work regardless of whether migration has been applied
    const eventResponsesData = Object.entries(eventResponses || {}).map(([eventId, response]) => {
      // Handle both old format (string) and new format (object)
      let status: string
      if (typeof response === 'string') {
        status = response
      } else if (response && typeof response === 'object' && 'status' in response) {
        status = (response as any).status
      } else {
        console.error('Invalid response format:', response)
        throw new Error(`Invalid event response format for event ${eventId}`)
      }
      
      // Only include status - no plusOne fields
      return {
        eventId,
        status: status,
      }
    })

    console.log('Creating RSVP:', {
      inviteLinkConfigId,
      name,
      phone,
      email,
      side,
      eventResponsesCount: eventResponsesData.length,
      sampleResponse: eventResponsesData[0],
    })

    // Create RSVP
    let rsvp
    try {
      rsvp = await prisma.rsvp.create({
        data: {
          inviteLinkConfigId,
          name,
          phone,
          email: email || null,
          side,
          plusOne: hasAnyPlusOne || false, // Keep for backward compatibility
          plusOneName: null,
          plusOneRelation: null,
          dietaryRequirements: dietaryRequirements || null,
          notes: notes || null,
          editToken,
          eventResponses: {
            create: eventResponsesData,
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
      console.log('RSVP created successfully:', rsvp.id)
    } catch (createError: any) {
      console.error('RSVP creation failed:', {
        message: createError?.message,
        code: createError?.code,
        meta: createError?.meta,
        stack: createError?.stack,
      })
      throw createError
    }

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
      eventResponses: rsvp.eventResponses.map((er: any) => ({
        eventId: er.eventId,
        eventName: er.event.name,
        status: er.status,
        plusOne: (er.plusOne || er.plus_one) || false,
        plusOneName: (er.plusOneName || er.plus_one_name) || null,
        plusOneRelation: (er.plusOneRelation || er.plus_one_relation) || null,
      })),
    })
  } catch (error: any) {
    console.error('Error submitting RSVP:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      meta: error?.meta,
      cause: error?.cause,
      name: error?.name,
    })
    
    const errorMessage = error?.message || String(error)
    const errorCode = error?.code
    
    // Check for specific Prisma errors
    if (errorCode === 'P2002') {
      return NextResponse.json(
        { 
          error: 'A record with this information already exists',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 400 }
      )
    }
    
    if (errorCode === 'P2003') {
      return NextResponse.json(
        { 
          error: 'Invalid reference - please check your event responses',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 400 }
      )
    }
    
    // Return detailed error in development, generic in production
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        code: process.env.NODE_ENV === 'development' ? errorCode : undefined,
      },
      { status: 500 }
    )
  }
}

