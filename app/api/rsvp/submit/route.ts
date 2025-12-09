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

    // Check if migration has been applied - try to query the column directly
    let useNewSchema = false
    try {
      // Try a simple query that will fail if column doesn't exist
      await prisma.$queryRaw`SELECT "plus_one" FROM "rsvp_event_responses" LIMIT 0`
      useNewSchema = true
      console.log('Schema check: Migration applied (new schema)')
    } catch (schemaCheckError: any) {
      // If query fails, column doesn't exist - use old schema
      const errorMsg = schemaCheckError?.message || String(schemaCheckError)
      if (errorMsg.includes('column') || errorMsg.includes('plus_one') || errorMsg.includes('does not exist')) {
        console.log('Schema check: Migration not applied (old schema)')
        useNewSchema = false
      } else {
        // Some other error - log it but assume old schema
        console.error('Unexpected error checking schema:', errorMsg)
        useNewSchema = false
      }
    }

    // Prepare event responses data
    const eventResponsesData = Object.entries(eventResponses || {}).map(([eventId, response]) => {
      // Handle both old format (string) and new format (object)
      const responseData = typeof response === 'string' 
        ? { status: response, plusOne: false, plusOneName: null, plusOneRelation: null }
        : response as any
      
      // Only include plus one fields if migration has been applied
      if (useNewSchema) {
        return {
          eventId,
          status: responseData.status,
          plusOne: responseData.plusOne || false,
          plusOneName: responseData.plusOne ? (responseData.plusOneName || null) : null,
          plusOneRelation: responseData.plusOne ? (responseData.plusOneRelation || null) : null,
        }
      } else {
        // Old schema - only include status
        return {
          eventId,
          status: responseData.status,
        }
      }
    })

    console.log('Creating RSVP:', {
      useNewSchema,
      eventResponsesCount: eventResponsesData.length,
      sampleResponse: eventResponsesData[0],
    })

    // Create RSVP - try with new schema first, fallback to old if it fails
    let rsvp
    try {
      rsvp = await prisma.rsvp.create({
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
    } catch (createError: any) {
      // If creation fails and we were using new schema, try again without plusOne fields
      const errorMsg = createError?.message || String(createError)
      if (useNewSchema && (errorMsg.includes('column') || errorMsg.includes('plus_one') || errorMsg.includes('does not exist'))) {
        console.log('Retrying RSVP creation without plusOne fields (migration not applied)')
        // Retry with old schema format
        const oldSchemaData = Object.entries(eventResponses || {}).map(([eventId, response]) => {
          const responseData = typeof response === 'string' ? response : (response as any).status
          return {
            eventId,
            status: responseData,
          }
        })
        
        rsvp = await prisma.rsvp.create({
          data: {
            inviteLinkConfigId,
            name,
            phone,
            email: email || null,
            side,
            plusOne: hasAnyPlusOne,
            plusOneName: null,
            plusOneRelation: null,
            dietaryRequirements: dietaryRequirements || null,
            notes: notes || null,
            editToken,
            eventResponses: {
              create: oldSchemaData,
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
      } else {
        // Re-throw if it's a different error
        throw createError
      }
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
      eventResponses: rsvp.eventResponses.map((er) => ({
        eventId: er.eventId,
        eventName: er.event.name,
        status: er.status,
        plusOne: er.plusOne || false,
        plusOneName: er.plusOneName || null,
        plusOneRelation: er.plusOneRelation || null,
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
    })
    
    // Check if it's a Prisma error about missing columns
    const errorMessage = error?.message || String(error)
    const isColumnError = errorMessage.includes('column') || 
                         errorMessage.includes('plus_one') || 
                         errorMessage.includes('does not exist') ||
                         error?.code === 'P2021' // Prisma table/column doesn't exist
    
    if (isColumnError) {
      return NextResponse.json(
        { 
          error: 'Database schema mismatch. Please contact administrator.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}

