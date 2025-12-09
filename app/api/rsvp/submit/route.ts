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
    // Default to false (old schema) to be safe
    let useNewSchema = false
    try {
      // Try a simple query that will fail if column doesn't exist
      await prisma.$queryRaw`SELECT "plus_one" FROM "rsvp_event_responses" LIMIT 0`
      useNewSchema = true
      console.log('Schema check: Migration applied (new schema)')
    } catch (schemaCheckError: any) {
      // If query fails, column doesn't exist - use old schema
      // This is expected if migration hasn't been applied
      useNewSchema = false
      console.log('Schema check: Using old schema (migration not applied or check failed)')
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
      // If creation fails, try again without plusOne fields (migration might not be applied)
      const errorMsg = createError?.message || String(createError)
      const isColumnError = errorMsg.includes('column') || 
                           errorMsg.includes('plus_one') || 
                           errorMsg.includes('does not exist') ||
                           errorMsg.includes('Unknown column')
      
      if (isColumnError) {
        console.log('Retrying RSVP creation without plusOne fields (migration not applied)')
        // Retry with old schema format
        const oldSchemaData = Object.entries(eventResponses || {}).map(([eventId, response]) => {
          const responseData = typeof response === 'string' ? response : (response as any).status
          return {
            eventId,
            status: responseData,
          }
        })
        
        try {
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
          console.log('RSVP created successfully with old schema')
        } catch (retryError: any) {
          // If retry also fails, throw the original error
          console.error('Retry also failed:', retryError?.message)
          throw createError
        }
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
    
    // Don't show schema mismatch error - the retry should have handled it
    // If we get here, it's a different error
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}

