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
        { eventResponses: { some: { plusOneName: { contains: search, mode: 'insensitive' } } } },
      ]
    }

    // Check if new schema exists to avoid querying non-existent columns
    let hasNewSchema = false
    let actualColumnNames: { rsvpId: string; eventId: string; status: string; plusOne?: string; plusOneName?: string; plusOneRelation?: string } | null = null
    
    // More robust schema detection - check for all three columns (both camelCase and snake_case)
    try {
      const schemaCheck = await prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'rsvp_event_responses' 
        AND column_name IN ('plusOne', 'plus_one', 'plusOneName', 'plus_one_name', 'plusOneRelation', 'plus_one_relation')
        LIMIT 6
      `
      // Check if we have all three columns (either camelCase or snake_case)
      const foundPlusOne = schemaCheck.some(c => c.column_name === 'plusOne' || c.column_name === 'plus_one')
      const foundPlusOneName = schemaCheck.some(c => c.column_name === 'plusOneName' || c.column_name === 'plus_one_name')
      const foundPlusOneRelation = schemaCheck.some(c => c.column_name === 'plusOneRelation' || c.column_name === 'plus_one_relation')
      hasNewSchema = foundPlusOne && foundPlusOneName && foundPlusOneRelation
      console.log('[Admin RSVPs] Schema detection result:', {
        foundColumns: schemaCheck,
        hasNewSchema: hasNewSchema,
        foundPlusOne,
        foundPlusOneName,
        foundPlusOneRelation,
        columnCount: schemaCheck?.length || 0,
      })
    } catch (schemaCheckError: any) {
      hasNewSchema = false
      console.log('[Admin RSVPs] Schema detection error (assuming old schema):', schemaCheckError?.message)
      
      // Get actual column names for old schema
      try {
        const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'rsvp_event_responses'
          ORDER BY ordinal_position
        `
        
        const rsvpIdCol = columns.find(c => 
          c.column_name.toLowerCase() === 'rsvpid' || 
          c.column_name.toLowerCase() === 'rsvp_id' ||
          c.column_name === 'rsvpId'
        )?.column_name
        
        const eventIdCol = columns.find(c => 
          c.column_name.toLowerCase() === 'eventid' || 
          c.column_name.toLowerCase() === 'event_id' ||
          c.column_name === 'eventId'
        )?.column_name
        
        const statusCol = columns.find(c => c.column_name.toLowerCase() === 'status')?.column_name
        const plusOneCol = columns.find(c => c.column_name.toLowerCase() === 'plus_one' || c.column_name.toLowerCase() === 'plusone')?.column_name
        const plusOneNameCol = columns.find(c => c.column_name.toLowerCase() === 'plus_one_name' || c.column_name.toLowerCase() === 'plusonename')?.column_name
        const plusOneRelationCol = columns.find(c => c.column_name.toLowerCase() === 'plus_one_relation' || c.column_name.toLowerCase() === 'plusonerelation')?.column_name
        
        if (rsvpIdCol && eventIdCol && statusCol) {
          actualColumnNames = {
            rsvpId: rsvpIdCol,
            eventId: eventIdCol,
            status: statusCol,
            ...(plusOneCol && { plusOne: plusOneCol }),
            ...(plusOneNameCol && { plusOneName: plusOneNameCol }),
            ...(plusOneRelationCol && { plusOneRelation: plusOneRelationCol }),
          }
          console.log('[Admin RSVPs] Detected column names:', actualColumnNames)
        }
      } catch (columnError: any) {
        console.error('Could not query column names:', columnError?.message)
      }
    }

    // Fetch RSVPs without eventResponses first to avoid schema issues
    const rsvps = await prisma.rsvp.findMany({
      where,
      include: {
        inviteLinkConfig: {
          select: {
            slug: true,
            label: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Now fetch event responses for each RSVP based on schema
    for (const rsvp of rsvps) {
      try {
        if (hasNewSchema) {
          // New schema - use Prisma normally, explicitly select plus one fields
          const responses = await prisma.rsvpEventResponse.findMany({
            where: { rsvpId: rsvp.id },
            select: {
              id: true,
              rsvpId: true,
              eventId: true,
              status: true,
              plusOne: true,
              plusOneName: true,
              plusOneRelation: true,
              createdAt: true,
              updatedAt: true,
              event: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })
          
          console.log(`[Admin RSVPs] Fetched ${responses.length} event responses for RSVP ${rsvp.id}`)
          console.log(`[Admin RSVPs] Raw Prisma responses for RSVP ${rsvp.id}:`, JSON.stringify(responses, null, 2))
          
          // Also verify with raw SQL to see actual database values - use detected column names
          // First detect the actual column names
          let rawVerify: any[] = []
          try {
            const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'rsvp_event_responses'
              ORDER BY ordinal_position
            `
            
            const eventIdCol = columns.find(c => c.column_name === 'eventId' || c.column_name.toLowerCase() === 'eventid' || c.column_name.toLowerCase() === 'event_id')?.column_name || 'eventId'
            const statusCol = columns.find(c => c.column_name.toLowerCase() === 'status')?.column_name || 'status'
            const rsvpIdCol = columns.find(c => c.column_name === 'rsvpId' || c.column_name.toLowerCase() === 'rsvpid' || c.column_name.toLowerCase() === 'rsvp_id')?.column_name || 'rsvpId'
            const plusOneCol = columns.find(c => c.column_name === 'plusOne' || c.column_name === 'plus_one')?.column_name
            const plusOneNameCol = columns.find(c => c.column_name === 'plusOneName' || c.column_name === 'plus_one_name')?.column_name
            const plusOneRelationCol = columns.find(c => c.column_name === 'plusOneRelation' || c.column_name === 'plus_one_relation')?.column_name
            
            if (plusOneCol && plusOneNameCol && plusOneRelationCol) {
              rawVerify = await prisma.$queryRawUnsafe<Array<any>>(
                `SELECT "${eventIdCol}" as "eventId", "${statusCol}" as status, "${plusOneCol}" as "plusOne", "${plusOneNameCol}" as "plusOneName", "${plusOneRelationCol}" as "plusOneRelation"
                 FROM rsvp_event_responses 
                 WHERE "${rsvpIdCol}" = $1`,
                rsvp.id
              )
            } else {
              rawVerify = await prisma.$queryRawUnsafe<Array<any>>(
                `SELECT "${eventIdCol}" as "eventId", "${statusCol}" as status
                 FROM rsvp_event_responses 
                 WHERE "${rsvpIdCol}" = $1`,
                rsvp.id
              )
            }
            console.log(`[Admin RSVPs] RAW DATABASE VALUES for RSVP ${rsvp.id}:`, JSON.stringify(rawVerify, null, 2))
          } catch (e) {
            console.warn(`[Admin RSVPs] Could not fetch raw values for RSVP ${rsvp.id}:`, e)
          }
          
          // Map to include plus one fields - Prisma should already have them
          const mappedResponses = responses.map((r: any) => {
            // Check if plusOne should be true based on name presence
            // Prisma returns camelCase, so these should be direct
            const plusOneNameRaw = r.plusOneName
            const plusOneRelationRaw = r.plusOneRelation
            const plusOneRaw = r.plusOne
            
            const hasPlusOneName = plusOneNameRaw && String(plusOneNameRaw).trim() !== '' && String(plusOneNameRaw).trim() !== 'null'
            const hasPlusOneRelation = plusOneRelationRaw && String(plusOneRelationRaw).trim() !== '' && String(plusOneRelationRaw).trim() !== 'null'
            const plusOne = Boolean(plusOneRaw || hasPlusOneName || hasPlusOneRelation || false)
            
            // ALWAYS return the raw values - let frontend decide what to display
            // Only trim if they exist, but don't filter them out
            const mapped = {
              id: r.id,
              eventId: r.eventId,
              status: r.status,
              plusOne: plusOne,
              plusOneName: plusOneNameRaw != null && plusOneNameRaw !== '' ? String(plusOneNameRaw).trim() : null,
              plusOneRelation: plusOneRelationRaw != null && plusOneRelationRaw !== '' ? String(plusOneRelationRaw).trim() : null,
              event: r.event || { id: r.eventId, name: 'Unknown Event' },
            }
            
            console.log(`[Admin RSVPs] Mapping event response for ${r.eventId}:`, {
              raw: { plusOneRaw, plusOneNameRaw, plusOneRelationRaw },
              mapped,
              hasPlusOneName,
              hasPlusOneRelation,
            })
            
            // Log ALL responses to see what we're getting
            console.log(`[Admin RSVPs] New schema - Event response for RSVP ${rsvp.id}, Event ${r.event?.name}:`, {
              rawPrismaResponse: r,
              eventId: r.eventId,
              eventName: r.event?.name,
              status: r.status,
              rawPlusOne: plusOneRaw,
              rawPlusOneName: plusOneNameRaw,
              rawPlusOneRelation: plusOneRelationRaw,
              hasPlusOneName: hasPlusOneName,
              computedPlusOne: plusOne,
              finalMapped: mapped,
            })
            
            return mapped
          })
          
          ;(rsvp as any).eventResponses = mappedResponses || []
          console.log(`[Admin RSVPs] Mapped ${mappedResponses.length} event responses for RSVP ${rsvp.id}:`, JSON.stringify(mappedResponses, null, 2))
          
          // CRITICAL: Verify eventResponses is set
          if (!(rsvp as any).eventResponses || (rsvp as any).eventResponses.length === 0) {
            console.error(`[Admin RSVPs] WARNING: RSVP ${rsvp.id} (${rsvp.name}) has NO event responses after mapping!`, {
              rsvpId: rsvp.id,
              rsvpName: rsvp.name,
              mappedResponsesCount: mappedResponses.length,
              mappedResponses: mappedResponses,
              rawResponsesCount: responses.length,
            })
          }
        } else {
          // Old schema - use raw SQL with actual column names
          if (actualColumnNames) {
            // Try to check if ALL three plus_one columns exist (both camelCase and snake_case)
            let hasPlusOneColumn = false
            let detectedPlusOneCol = actualColumnNames.plusOne || 'plusOne'
            let detectedPlusOneNameCol = actualColumnNames.plusOneName || 'plusOneName'
            let detectedPlusOneRelationCol = actualColumnNames.plusOneRelation || 'plusOneRelation'
            
            try {
              const plusOneCheck = await prisma.$queryRaw<Array<{ column_name: string }>>`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'rsvp_event_responses' 
                AND column_name IN ('plusOne', 'plus_one', 'plusOneName', 'plus_one_name', 'plusOneRelation', 'plus_one_relation')
                LIMIT 6
              `
              // Check if we have all three columns (either camelCase or snake_case)
              const foundPlusOne = plusOneCheck.find(c => c.column_name === 'plusOne' || c.column_name === 'plus_one')
              const foundPlusOneName = plusOneCheck.find(c => c.column_name === 'plusOneName' || c.column_name === 'plus_one_name')
              const foundPlusOneRelation = plusOneCheck.find(c => c.column_name === 'plusOneRelation' || c.column_name === 'plus_one_relation')
              hasPlusOneColumn = !!(foundPlusOne && foundPlusOneName && foundPlusOneRelation)
              
              if (hasPlusOneColumn) {
                detectedPlusOneCol = foundPlusOne!.column_name
                detectedPlusOneNameCol = foundPlusOneName!.column_name
                detectedPlusOneRelationCol = foundPlusOneRelation!.column_name
              }
              
              console.log(`[Admin RSVPs] Old schema for RSVP ${rsvp.id}: plus_one columns check result:`, {
                found: plusOneCheck,
                hasAllThree: hasPlusOneColumn,
                detectedPlusOneCol,
                detectedPlusOneNameCol,
                detectedPlusOneRelationCol,
                actualColumnNames: actualColumnNames,
              })
            } catch (e) {
              console.log(`[Admin RSVPs] Old schema for RSVP ${rsvp.id}: Error checking plus_one columns:`, e)
              hasPlusOneColumn = false
            }

            let responses: any[]
            if (hasPlusOneColumn) {
              // Query with plus one fields using detected column names
              const query = `SELECT id, "${actualColumnNames.rsvpId}" as "rsvpId", "${actualColumnNames.eventId}" as "eventId", "${actualColumnNames.status}" as status,
                            "${detectedPlusOneCol}" as "plusOne", "${detectedPlusOneNameCol}" as "plusOneName", "${detectedPlusOneRelationCol}" as "plusOneRelation"
                            FROM rsvp_event_responses
                            WHERE "${actualColumnNames.rsvpId}" = $1`
              
              console.log(`[Admin RSVPs] Old schema for RSVP ${rsvp.id}: Querying with plus one columns:`, query)
              console.log(`[Admin RSVPs] Using detected column names:`, { detectedPlusOneCol, detectedPlusOneNameCol, detectedPlusOneRelationCol })
              
              responses = await prisma.$queryRawUnsafe<Array<{
                id: string;
                rsvpId: string;
                eventId: string;
                status: string;
                plusOne?: boolean;
                plusOneName?: string | null;
                plusOneRelation?: string | null;
              }>>(query, rsvp.id)
              
              console.log(`[Admin RSVPs] Old schema for RSVP ${rsvp.id}: Fetched ${responses.length} responses with plus one data:`, JSON.stringify(responses, null, 2))
            } else {
              // Query without plus one fields
              const query = `SELECT id, "${actualColumnNames.rsvpId}" as "rsvpId", "${actualColumnNames.eventId}" as "eventId", "${actualColumnNames.status}" as status
                            FROM rsvp_event_responses
                            WHERE "${actualColumnNames.rsvpId}" = $1`
              
              console.log(`[Admin RSVPs] Old schema for RSVP ${rsvp.id}: Querying without plus one columns:`, query)
              
              responses = await prisma.$queryRawUnsafe<Array<{
                id: string;
                rsvpId: string;
                eventId: string;
                status: string;
              }>>(query, rsvp.id)
              
              console.log(`[Admin RSVPs] Old schema for RSVP ${rsvp.id}: Fetched ${responses.length} responses without plus one data`)
            }
            
            const eventIds = responses.map(r => r.eventId)
            const events = eventIds.length > 0 ? await prisma.event.findMany({
              where: { id: { in: eventIds } },
              select: { id: true, name: true },
            }) : []
            
            ;(rsvp as any).eventResponses = responses.map(r => {
              // Check if plusOne should be true based on name presence
              const plusOneNameRaw = (r as any).plusOneName
              const plusOneRelationRaw = (r as any).plusOneRelation
              const plusOneRaw = (r as any).plusOne
              
              const hasPlusOneName = plusOneNameRaw && String(plusOneNameRaw).trim() !== ''
              const plusOne = Boolean(plusOneRaw || hasPlusOneName || false)
              
              const mapped = {
                id: r.id,
                eventId: r.eventId,
                status: r.status,
                plusOne: plusOne,
                plusOneName: plusOneNameRaw ? String(plusOneNameRaw).trim() : null,
                plusOneRelation: plusOneRelationRaw ? String(plusOneRelationRaw).trim() : null,
                event: events.find(e => e.id === r.eventId) || { id: r.eventId, name: 'Unknown Event' },
              }
              
              // Log ALL responses to see what we're getting
              console.log(`[Admin RSVPs] Old schema - Event response for RSVP ${rsvp.id}, Event ${mapped.event.name}:`, {
                eventId: r.eventId,
                eventName: mapped.event.name,
                status: r.status,
                rawPlusOne: plusOneRaw,
                rawPlusOneName: plusOneNameRaw,
                rawPlusOneRelation: plusOneRelationRaw,
                hasPlusOneName: hasPlusOneName,
                computedPlusOne: plusOne,
                finalMapped: mapped,
              })
              
              return mapped
            })
          } else {
            // Fallback: try common column names
            try {
              const responses = await prisma.$queryRawUnsafe<Array<{
                id: string;
                rsvpId: string;
                eventId: string;
                status: string;
              }>>(
                `SELECT id, rsvp_id as "rsvpId", event_id as "eventId", status
                 FROM rsvp_event_responses
                 WHERE rsvp_id = $1`,
                rsvp.id
              )
              
              const eventIds = responses.map(r => r.eventId)
              const events = eventIds.length > 0 ? await prisma.event.findMany({
                where: { id: { in: eventIds } },
                select: { id: true, name: true },
              }) : []
              
              ;(rsvp as any).eventResponses = responses.map(r => ({
                ...r,
                event: events.find(e => e.id === r.eventId) || { id: r.eventId, name: 'Unknown Event' },
              }))
            } catch (fallbackError: any) {
              console.error('Fallback query failed:', fallbackError?.message)
              ;(rsvp as any).eventResponses = []
            }
          }
        }
      } catch (responseError: any) {
        console.error(`Error fetching event responses for RSVP ${rsvp.id}:`, responseError?.message)
        ;(rsvp as any).eventResponses = []
      }
      
      // Ensure eventResponses is always defined and is an array
      if (!(rsvp as any).eventResponses || !Array.isArray((rsvp as any).eventResponses)) {
        console.error(`[Admin RSVPs] CRITICAL: RSVP ${rsvp.id} (${rsvp.name}) has invalid eventResponses!`, {
          rsvpId: rsvp.id,
          rsvpName: rsvp.name,
          eventResponses: (rsvp as any).eventResponses,
          type: typeof (rsvp as any).eventResponses,
        })
        ;(rsvp as any).eventResponses = []
      }
      
      // Log final state for debugging
      console.log(`[Admin RSVPs] Final RSVP ${rsvp.id} (${rsvp.name}):`, {
        hasEventResponses: !!(rsvp as any).eventResponses,
        eventResponsesCount: (rsvp as any).eventResponses?.length || 0,
        eventResponses: (rsvp as any).eventResponses,
      })
    }

    // Final verification - log what we're returning
    console.log('[Admin RSVPs] FINAL RSVPs DATA:', JSON.stringify(rsvps.map((r: any) => ({
      id: r.id,
      name: r.name,
      eventResponsesCount: r.eventResponses?.length || 0,
      hasEventResponses: !!r.eventResponses,
      eventResponses: r.eventResponses?.map((er: any) => ({
        id: er.id,
        eventId: er.eventId,
        eventName: er.event?.name,
        status: er.status,
        plusOne: er.plusOne,
        plusOneName: er.plusOneName,
        plusOneRelation: er.plusOneRelation,
        hasEvent: !!er.event,
      })) || [],
    })), null, 2))

    // Ensure eventResponses is always an array, even if empty
    const rsvpsWithEventResponses = rsvps.map((r: any) => ({
      ...r,
      eventResponses: r.eventResponses || [],
    }))

    return NextResponse.json(rsvpsWithEventResponses)
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

      // Prepare event responses data with Plus One information
      const eventResponsesData = Object.entries(eventResponses).map(([eventId, response]) => {
        // Handle both old format (string) and new format (object with Plus One data)
        if (typeof response === 'string') {
          return {
            rsvpId: rsvp.id,
            eventId,
            status: response,
            plusOne: false,
            plusOneName: null,
            plusOneRelation: null,
          }
        } else {
          const responseData = response as any
          return {
            rsvpId: rsvp.id,
            eventId,
            status: responseData.status,
            plusOne: responseData.plusOne || false,
            plusOneName: responseData.plusOneName && responseData.plusOneName.trim() ? responseData.plusOneName.trim() : null,
            plusOneRelation: responseData.plusOneRelation && responseData.plusOneRelation.trim() ? responseData.plusOneRelation.trim() : null,
          }
        }
      })

      // Create new responses using raw SQL to handle both column sets
      for (const responseData of eventResponsesData) {
        const responseId = `c${Date.now().toString(36)}${Math.random().toString(36).substring(2, 15)}`
        const now = new Date()
        
        await prisma.$executeRaw`
          INSERT INTO rsvp_event_responses (
            id, 
            "rsvpId",
            "eventId",
            rsvp_id, 
            event_id, 
            status, 
            plus_one, 
            plus_one_name, 
            plus_one_relation, 
            "createdAt",
            "updatedAt",
            created_at, 
            updated_at
          ) VALUES (
            ${responseId}::text,
            ${responseData.rsvpId}::text,
            ${responseData.eventId}::text,
            ${responseData.rsvpId}::text,
            ${responseData.eventId}::text,
            ${responseData.status}::text,
            ${responseData.plusOne}::boolean,
            ${responseData.plusOneName}::text,
            ${responseData.plusOneRelation}::text,
            ${now}::timestamp,
            ${now}::timestamp,
            ${now}::timestamp,
            ${now}::timestamp
          )
        `
      }
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
          select: {
            id: true,
            rsvpId: true,
            eventId: true,
            status: true,
            plusOne: true,
            plusOneName: true,
            plusOneRelation: true,
            createdAt: true,
            updatedAt: true,
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

    console.log(`[Admin RSVPs DELETE] Attempting to delete RSVP ${id}`)

    // Check if RSVP exists before attempting to delete
    const existingRsvp = await prisma.rsvp.findUnique({
      where: { id },
    })

    if (!existingRsvp) {
      console.log(`[Admin RSVPs DELETE] RSVP ${id} not found`)
      return NextResponse.json(
        { error: 'RSVP not found' },
        { status: 404 }
      )
    }

    console.log(`[Admin RSVPs DELETE] RSVP ${id} found, proceeding with deletion`)

    // Delete RSVP - Prisma will automatically cascade delete event responses
    // due to onDelete: Cascade in the schema
    try {
      await prisma.rsvp.delete({
        where: { id },
      })
      console.log(`[Admin RSVPs DELETE] Successfully deleted RSVP ${id} and its event responses`)
    } catch (deleteError: any) {
      console.error(`[Admin RSVPs DELETE] Error deleting RSVP ${id}:`, deleteError)
      console.error(`[Admin RSVPs DELETE] Error details:`, {
        code: deleteError?.code,
        message: deleteError?.message,
        meta: deleteError?.meta,
      })
      throw deleteError
    }

    console.log(`[Admin RSVPs] Successfully deleted RSVP ${id}`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting RSVP:', error)
    
    // Provide more specific error messages
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'RSVP not found' },
        { status: 404 }
      )
    }
    
    const errorMessage = error?.message || 'Failed to delete RSVP'
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

