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
      // Ensure all event response data is valid
      if (!eventResponsesData || eventResponsesData.length === 0) {
        throw new Error('No event responses provided')
      }

      // Validate all statuses are valid
      const validStatuses = ['YES', 'NO', 'MAYBE']
      for (const response of eventResponsesData) {
        if (!validStatuses.includes(response.status)) {
          throw new Error(`Invalid status: ${response.status} for event ${response.eventId}`)
        }
      }

      // Check if the new schema columns exist and get actual column names
      let hasNewSchema = false
      let columnNames: { rsvpId: string; eventId: string; status: string; createdAt: string; updatedAt: string } | null = null
      
      try {
        // Try to query the new schema column
        await prisma.$queryRaw`SELECT "plus_one" FROM "rsvp_event_responses" LIMIT 0`
        hasNewSchema = true
        console.log('Database has new schema (with plus_one columns)')
      } catch (schemaCheckError: any) {
        hasNewSchema = false
        console.log('Database has old schema (no plus_one columns)')
        
        // Query actual column names from information_schema
        try {
          const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'rsvp_event_responses'
            ORDER BY ordinal_position
          `
          
          // Find the actual column names
          const rsvpIdCol = columns.find(c => c.column_name.toLowerCase().includes('rsvp') && c.column_name.toLowerCase().includes('id'))?.column_name
          const eventIdCol = columns.find(c => c.column_name.toLowerCase().includes('event') && c.column_name.toLowerCase().includes('id'))?.column_name
          const statusCol = columns.find(c => c.column_name.toLowerCase() === 'status')?.column_name
          const createdAtCol = columns.find(c => c.column_name.toLowerCase().includes('created'))?.column_name
          const updatedAtCol = columns.find(c => c.column_name.toLowerCase().includes('updated'))?.column_name
          
          if (rsvpIdCol && eventIdCol && statusCol && createdAtCol && updatedAtCol) {
            columnNames = {
              rsvpId: rsvpIdCol,
              eventId: eventIdCol,
              status: statusCol,
              createdAt: createdAtCol,
              updatedAt: updatedAtCol,
            }
            console.log('Found column names:', columnNames)
          }
        } catch (columnCheckError: any) {
          console.error('Could not query column names:', columnCheckError?.message)
        }
      }

      // Try to create RSVP - use a transaction to ensure atomicity
      rsvp = await prisma.$transaction(async (tx) => {
        // First create the RSVP
        const newRsvp = await tx.rsvp.create({
          data: {
            inviteLinkConfigId,
            name,
            phone,
            email: email || null,
            side,
            plusOne: hasAnyPlusOne || false,
            plusOneName: null,
            plusOneRelation: null,
            dietaryRequirements: dietaryRequirements || null,
            notes: notes || null,
            editToken,
          },
        })

        // Create event responses
        // Use Prisma's createMany - it handles column mapping automatically
        // If schema doesn't match, we'll catch and handle it
        try {
          if (hasNewSchema) {
            // New schema - include plus one fields
            await tx.rsvpEventResponse.createMany({
              data: eventResponsesData.map((responseData) => ({
                rsvpId: newRsvp.id,
                eventId: responseData.eventId,
                status: responseData.status,
                plusOne: false,
                plusOneName: null,
                plusOneRelation: null,
              })),
            })
          } else {
            // Old schema - only include basic fields
            // Prisma will map camelCase to snake_case automatically
            await tx.rsvpEventResponse.createMany({
              data: eventResponsesData.map((responseData) => ({
                rsvpId: newRsvp.id,
                eventId: responseData.eventId,
                status: responseData.status,
              })),
            })
          }
        } catch (createError: any) {
          // If createMany fails, try creating one by one to see which one fails
          console.error('createMany failed, trying individual creates:', createError?.message)
          
          for (const responseData of eventResponsesData) {
            try {
              if (hasNewSchema) {
                await tx.rsvpEventResponse.create({
                  data: {
                    rsvpId: newRsvp.id,
                    eventId: responseData.eventId,
                    status: responseData.status,
                    plusOne: false,
                    plusOneName: null,
                    plusOneRelation: null,
                  },
                })
              } else {
                // For old schema, Prisma should still work - it just won't set the plusOne fields
                // But we need to make sure we're not including them
                await tx.rsvpEventResponse.create({
                  data: {
                    rsvpId: newRsvp.id,
                    eventId: responseData.eventId,
                    status: responseData.status,
                  },
                })
              }
            } catch (individualError: any) {
              console.error('Individual create failed:', {
                eventId: responseData.eventId,
                error: individualError?.message,
                code: individualError?.code,
                meta: individualError?.meta,
              })
              throw individualError
            }
          }
        }

        // Fetch the complete RSVP with relations
        return await tx.rsvp.findUnique({
          where: { id: newRsvp.id },
          include: {
            eventResponses: {
              include: {
                event: true,
              },
            },
          },
        })
      })
      
      if (!rsvp) {
        throw new Error('Failed to create RSVP')
      }
      
      console.log('RSVP created successfully:', rsvp.id)
    } catch (createError: any) {
      console.error('RSVP creation failed:', {
        message: createError?.message,
        code: createError?.code,
        meta: createError?.meta,
        stack: createError?.stack,
        eventResponsesData: eventResponsesData,
      })
      
      // Log the error but don't throw a generic message - let the actual error through
      console.error('RSVP creation error details:', {
        code: createError?.code,
        message: createError?.message,
        meta: createError?.meta,
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
      eventResponses: rsvp.eventResponses.map((er: any) => {
        // Safely access plus one fields - they may not exist if migration hasn't been applied
        const plusOne = er.plusOne !== undefined ? er.plusOne : (er.plus_one !== undefined ? er.plus_one : false)
        const plusOneName = er.plusOneName !== undefined ? er.plusOneName : (er.plus_one_name !== undefined ? er.plus_one_name : null)
        const plusOneRelation = er.plusOneRelation !== undefined ? er.plusOneRelation : (er.plus_one_relation !== undefined ? er.plus_one_relation : null)
        
        return {
          eventId: er.eventId,
          eventName: er.event.name,
          status: er.status,
          plusOne,
          plusOneName,
          plusOneRelation,
        }
      }),
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
    
    // Return detailed error - include more info to help debug
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: isDevelopment ? errorMessage : errorMessage.substring(0, 200), // Show first 200 chars even in production
        code: isDevelopment ? errorCode : undefined,
        // Include error code if it's a Prisma error
        prismaCode: errorCode?.startsWith('P') ? errorCode : undefined,
      },
      { status: 500 }
    )
  }
}

