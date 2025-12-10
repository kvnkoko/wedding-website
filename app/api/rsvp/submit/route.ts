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

    // Always start with old schema to be safe - we'll detect and retry if needed
    // This prevents errors if the schema check itself fails
    let useNewSchema = false

    // Prepare event responses data - start with old schema (no plusOne fields)
    // We'll try new schema first, then fallback if it fails
    const prepareEventResponsesData = (includePlusOne: boolean) => {
      return Object.entries(eventResponses || {}).map(([eventId, response]) => {
        // Handle both old format (string) and new format (object)
        const responseData = typeof response === 'string' 
          ? { status: response, plusOne: false, plusOneName: null, plusOneRelation: null }
          : response as any
        
        if (includePlusOne) {
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
    }

    // Try to create RSVP - first with new schema, then fallback to old
    let rsvp
    let createAttempted = false
    
    // First, try with new schema (per-event plus ones)
    try {
      const newSchemaData = prepareEventResponsesData(true)
      console.log('Attempting RSVP creation with new schema (per-event plus ones)')
      
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
            create: newSchemaData,
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
      createAttempted = true
      console.log('RSVP created successfully with new schema')
    } catch (createError: any) {
      // If creation fails, try again without plusOne fields
      const errorMsg = createError?.message || String(createError)
      const isColumnError = errorMsg.includes('column') || 
                           errorMsg.includes('plus_one') || 
                           errorMsg.includes('does not exist') ||
                           errorMsg.includes('Unknown column') ||
                           errorMsg.includes('P2021') // Prisma error code for missing column
      
      if (isColumnError) {
        console.log('New schema failed, retrying with old schema (no per-event plus ones)')
        // Retry with old schema format (no plusOne fields)
        const oldSchemaData = prepareEventResponsesData(false)
        
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
          createAttempted = true
          console.log('RSVP created successfully with old schema')
        } catch (retryError: any) {
          // If retry also fails, log and throw
          console.error('Both schema attempts failed. Retry error:', retryError?.message)
          throw retryError
        }
      } else {
        // Different error - throw it
        console.error('RSVP creation failed with non-column error:', errorMsg)
        throw createError
      }
    }
    
    if (!createAttempted || !rsvp) {
      throw new Error('Failed to create RSVP after all attempts')
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
    const errorMessage = error?.message || String(error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}

