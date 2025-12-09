import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering and prevent static analysis
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Prevent Next.js from trying to collect page data during build
export const dynamicParams = true

export async function GET(request: NextRequest) {
  // CRITICAL: Early return during build - must happen before ANY imports
  // Vercel sets VERCEL=1 during build, so check for its absence
  const isBuildTime = 
    !process.env.DATABASE_URL || 
    process.env.NEXT_PHASE === 'phase-production-build' ||
    (process.env.NODE_ENV === 'production' && !process.env.VERCEL)
  
  if (isBuildTime) {
    // Return immediately without any imports
    return new NextResponse(
      JSON.stringify({ stats: [], totals: { totalRsvps: 0, totalPlusOnes: 0 } }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Only import after build-time check passes
    const { verifyAdminSession } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/prisma')
    
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to query with new schema first (per-event plus ones)
    // If that fails (migration not applied), fall back to old schema
    let events: any[]
    let allRsvps: any[]
    let useNewSchema = true
    
    try {
      // Try querying with new schema (includes plusOne on RsvpEventResponse)
      events = await prisma.event.findMany({
        include: {
          rsvpResponses: true,
        },
      })
      
      allRsvps = await prisma.rsvp.findMany({
        include: {
          eventResponses: true,
        },
      })
      
      // Test if plusOne field exists by checking first response
      if (events.length > 0 && events[0].rsvpResponses.length > 0) {
        const testResponse = events[0].rsvpResponses[0]
        if (typeof (testResponse as any).plusOne === 'undefined') {
          useNewSchema = false
        }
      }
    } catch (schemaError: any) {
      // If query fails due to missing columns, use old schema approach
      if (schemaError?.message?.includes('column') || schemaError?.message?.includes('plusOne')) {
        useNewSchema = false
        // Re-query without the new fields
        events = await prisma.event.findMany({
          include: {
            rsvpResponses: true,
          },
        })
        
        allRsvps = await prisma.rsvp.findMany({
          include: {
            eventResponses: true,
          },
        })
      } else {
        throw schemaError
      }
    }

    const stats = events.map((event) => {
      const responses = event.rsvpResponses
      const yesCount = responses.filter((r) => r.status === 'YES').length
      const noCount = responses.filter((r) => r.status === 'NO').length

      // Count plus-ones based on schema version
      let plusOnes = 0
      if (useNewSchema) {
        // New schema: count per-event plus ones
        plusOnes = event.rsvpResponses.filter((r) => r.status === 'YES' && (r as any).plusOne === true).length
      } else {
        // Old schema: count from RSVP level
        const yesRsvps = allRsvps.filter((rsvp) =>
          rsvp.eventResponses.some(
            (er) => er.eventId === event.id && er.status === 'YES'
          )
        )
        plusOnes = yesRsvps.filter((r) => (r as any).plusOne === true).length
      }
      const totalAttendees = yesCount + plusOnes

      return {
        eventId: event.id,
        eventName: event.name,
        capacity: event.capacity,
        yes: yesCount,
        no: noCount,
        totalAttendees,
        plusOnes,
      }
    })

    const totalRsvps = allRsvps.length
    // Count total plus ones based on schema version
    let totalPlusOnes = 0
    if (useNewSchema) {
      totalPlusOnes = events.reduce((sum, event) => {
        return sum + event.rsvpResponses.filter((r) => r.status === 'YES' && (r as any).plusOne === true).length
      }, 0)
    } else {
      totalPlusOnes = allRsvps.filter((r) => (r as any).plusOne === true).length
    }

    return NextResponse.json({
      stats,
      totals: {
        totalRsvps,
        totalPlusOnes,
      },
    })
  } catch (error: any) {
    // During build, catch any errors and return empty data
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        stats: [], 
        totals: { totalRsvps: 0, totalPlusOnes: 0 } 
      })
    }
    console.error('Error fetching dashboard stats:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        hint: error?.message?.includes('prisma') ? 'Database connection issue. Check DATABASE_URL and ensure migrations are applied.' : undefined
      },
      { status: 500 }
    )
  }
}
