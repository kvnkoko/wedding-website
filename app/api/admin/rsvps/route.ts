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
    let actualColumnNames: { rsvpId: string; eventId: string; status: string } | null = null
    
    try {
      await prisma.$queryRaw`SELECT "plus_one" FROM "rsvp_event_responses" LIMIT 0`
      hasNewSchema = true
    } catch {
      hasNewSchema = false
      
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
        
        if (rsvpIdCol && eventIdCol && statusCol) {
          actualColumnNames = {
            rsvpId: rsvpIdCol,
            eventId: eventIdCol,
            status: statusCol,
          }
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
          // Map to include plus one fields
          ;(rsvp as any).eventResponses = responses.map((r: any) => {
            // Check if plusOne should be true based on name presence
            const hasPlusOneName = r.plusOneName && r.plusOneName.trim()
            const plusOne = r.plusOne || hasPlusOneName || false
            
            const mapped = {
              id: r.id,
              eventId: r.eventId,
              status: r.status,
              plusOne: plusOne,
              plusOneName: r.plusOneName || null,
              plusOneRelation: r.plusOneRelation || null,
              event: r.event,
            }
            // Debug logging for all responses with plus one data
            if (hasPlusOneName || r.plusOne) {
              console.log(`[Admin RSVPs] Event response with plus one for RSVP ${rsvp.id}:`, {
                eventId: r.eventId,
                eventName: r.event?.name,
                rawPlusOne: r.plusOne,
                rawPlusOneName: r.plusOneName,
                rawPlusOneRelation: r.plusOneRelation,
                computedPlusOne: plusOne,
                mapped: mapped,
              })
            }
            return mapped
          })
        } else {
          // Old schema - use raw SQL with actual column names
          if (actualColumnNames) {
            // Try to check if plus_one column exists
            let hasPlusOneColumn = false
            try {
              const plusOneCheck = await prisma.$queryRaw<Array<{ column_name: string }>>`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'rsvp_event_responses' 
                AND column_name IN ('plus_one', 'plusOne', 'plus_one_name', 'plusOneName')
                LIMIT 1
              `
              hasPlusOneColumn = Array.isArray(plusOneCheck) && plusOneCheck.length > 0
            } catch {
              hasPlusOneColumn = false
            }

            let responses: any[]
            if (hasPlusOneColumn) {
              // Query with plus one fields
              responses = await prisma.$queryRawUnsafe<Array<{
                id: string;
                rsvpId: string;
                eventId: string;
                status: string;
                plusOne?: boolean;
                plusOneName?: string | null;
                plusOneRelation?: string | null;
              }>>(
                `SELECT id, "${actualColumnNames.rsvpId}" as "rsvpId", "${actualColumnNames.eventId}" as "eventId", "${actualColumnNames.status}" as status,
                        plus_one as "plusOne", plus_one_name as "plusOneName", plus_one_relation as "plusOneRelation"
                 FROM rsvp_event_responses
                 WHERE "${actualColumnNames.rsvpId}" = $1`,
                rsvp.id
              )
            } else {
              // Query without plus one fields
              responses = await prisma.$queryRawUnsafe<Array<{
                id: string;
                rsvpId: string;
                eventId: string;
                status: string;
              }>>(
                `SELECT id, "${actualColumnNames.rsvpId}" as "rsvpId", "${actualColumnNames.eventId}" as "eventId", "${actualColumnNames.status}" as status
                 FROM rsvp_event_responses
                 WHERE "${actualColumnNames.rsvpId}" = $1`,
                rsvp.id
              )
            }
            
            const eventIds = responses.map(r => r.eventId)
            const events = eventIds.length > 0 ? await prisma.event.findMany({
              where: { id: { in: eventIds } },
              select: { id: true, name: true },
            }) : []
            
            ;(rsvp as any).eventResponses = responses.map(r => {
              // Check if plusOne should be true based on name presence
              const hasPlusOneName = r.plusOneName && r.plusOneName.trim()
              const plusOne = r.plusOne || hasPlusOneName || false
              
              const mapped = {
                ...r,
                plusOne: plusOne,
                plusOneName: r.plusOneName || null,
                plusOneRelation: r.plusOneRelation || null,
                event: events.find(e => e.id === r.eventId) || { id: r.eventId, name: 'Unknown Event' },
              }
              
              // Debug logging for responses with plus one data
              if (hasPlusOneName || r.plusOne) {
                console.log(`[Admin RSVPs] Old schema - Event response with plus one for RSVP ${rsvp.id}:`, {
                  eventId: r.eventId,
                  rawPlusOne: r.plusOne,
                  rawPlusOneName: r.plusOneName,
                  rawPlusOneRelation: r.plusOneRelation,
                  computedPlusOne: plusOne,
                  mapped: mapped,
                })
              }
              
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

    // Delete event responses first (cascade)
    await prisma.rsvpEventResponse.deleteMany({
      where: { rsvpId: id },
    })

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

