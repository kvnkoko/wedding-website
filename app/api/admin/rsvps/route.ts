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
          // New schema - use Prisma normally, include plus one fields
          const responses = await prisma.rsvpEventResponse.findMany({
            where: { rsvpId: rsvp.id },
          include: {
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          })
          
          console.log(`[Admin RSVPs] Fetched ${responses.length} event responses for RSVP ${rsvp.id}`)
          
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
          
          // Map to include plus one fields
          ;(rsvp as any).eventResponses = responses.map((r: any) => {
            // Check if plusOne should be true based on name presence
            const plusOneNameRaw = r.plusOneName
            const plusOneRelationRaw = r.plusOneRelation
            const plusOneRaw = r.plusOne
            
            const hasPlusOneName = plusOneNameRaw && String(plusOneNameRaw).trim() !== ''
            const plusOne = Boolean(plusOneRaw || hasPlusOneName || false)
            
            const mapped = {
              id: r.id,
              eventId: r.eventId,
              status: r.status,
              plusOne: plusOne,
              plusOneName: plusOneNameRaw ? String(plusOneNameRaw).trim() : null,
              plusOneRelation: plusOneRelationRaw ? String(plusOneRelationRaw).trim() : null,
              event: r.event,
            }
            
            // Log ALL responses to see what we're getting
            console.log(`[Admin RSVPs] New schema - Event response for RSVP ${rsvp.id}, Event ${r.event?.name}:`, {
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
        } else {
          // Old schema - use raw SQL with actual column names
          if (actualColumnNames) {
            // Try to check if ALL three plus_one columns exist
            let hasPlusOneColumn = false
            try {
              const plusOneCheck = await prisma.$queryRaw<Array<{ column_name: string }>>`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'rsvp_event_responses' 
                AND column_name IN ('plus_one', 'plus_one_name', 'plus_one_relation')
                LIMIT 3
              `
              hasPlusOneColumn = Array.isArray(plusOneCheck) && plusOneCheck.length === 3
              console.log(`[Admin RSVPs] Old schema for RSVP ${rsvp.id}: plus_one columns check result:`, {
                found: plusOneCheck,
                hasAllThree: hasPlusOneColumn,
                actualColumnNames: actualColumnNames,
              })
            } catch (e) {
              console.log(`[Admin RSVPs] Old schema for RSVP ${rsvp.id}: Error checking plus_one columns:`, e)
              hasPlusOneColumn = false
            }

            let responses: any[]
            if (hasPlusOneColumn && actualColumnNames.plusOne && actualColumnNames.plusOneName && actualColumnNames.plusOneRelation) {
              // Query with plus one fields using actual column names
              const query = `SELECT id, "${actualColumnNames.rsvpId}" as "rsvpId", "${actualColumnNames.eventId}" as "eventId", "${actualColumnNames.status}" as status,
                            "${actualColumnNames.plusOne}" as "plusOne", "${actualColumnNames.plusOneName}" as "plusOneName", "${actualColumnNames.plusOneRelation}" as "plusOneRelation"
                            FROM rsvp_event_responses
                            WHERE "${actualColumnNames.rsvpId}" = $1`
              
              console.log(`[Admin RSVPs] Old schema for RSVP ${rsvp.id}: Querying with plus one columns:`, query)
              
              responses = await prisma.$queryRawUnsafe<Array<{
                id: string;
                rsvpId: string;
                eventId: string;
                status: string;
                plusOne?: boolean;
                plusOneName?: string | null;
                plusOneRelation?: string | null;
              }>>(query, rsvp.id)
              
              console.log(`[Admin RSVPs] Old schema for RSVP ${rsvp.id}: Fetched ${responses.length} responses with plus one data:`, responses)
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
    }

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

    // Delete event responses first (cascade) - use raw SQL to avoid schema issues
    try {
      // Get actual column names
      const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'rsvp_event_responses'
        ORDER BY ordinal_position
      `
      
      const rsvpIdCol = columns.find(c => 
        c.column_name === 'rsvpId' || 
        c.column_name.toLowerCase() === 'rsvpid' || 
        c.column_name.toLowerCase() === 'rsvp_id'
      )?.column_name || 'rsvpId'
      
      // Delete using raw SQL
      await prisma.$executeRawUnsafe(
        `DELETE FROM rsvp_event_responses WHERE "${rsvpIdCol}" = $1`,
        id
      )
    } catch (error: any) {
      console.error('Error deleting event responses with raw SQL, trying Prisma:', error)
      // Fallback to Prisma
      try {
        await prisma.rsvpEventResponse.deleteMany({
          where: { rsvpId: id },
        })
      } catch (prismaError: any) {
        console.error('Prisma delete also failed:', prismaError)
        // Continue anyway - cascade might handle it
      }
    }

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

