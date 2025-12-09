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

    // Query events and RSVPs - use try-catch for each query
    let events: any[] = []
    let allRsvps: any[] = []
    let useNewSchema = false

    try {
      // Try to query events with rsvpResponses
      events = await prisma.event.findMany({
        include: {
          rsvpResponses: true,
        },
      })
      
      // Try to query RSVPs with eventResponses
      allRsvps = await prisma.rsvp.findMany({
        include: {
          eventResponses: true,
        },
      })

      // Check if plus_one column exists by trying to access it on first response
      if (events.length > 0 && events[0].rsvpResponses && events[0].rsvpResponses.length > 0) {
        const firstResponse = events[0].rsvpResponses[0] as any
        // Check if plusOne property exists (will be undefined if column doesn't exist)
        if ('plusOne' in firstResponse || firstResponse.plusOne !== undefined) {
          useNewSchema = true
        }
      }
    } catch (queryError: any) {
      console.error('Error querying database:', queryError?.message)
      // If query fails, try without includes
      try {
        events = await prisma.event.findMany()
        allRsvps = await prisma.rsvp.findMany()
        useNewSchema = false
      } catch (fallbackError: any) {
        console.error('Fallback query also failed:', fallbackError?.message)
        // Return empty data if queries fail
        return NextResponse.json({
          stats: [],
          totals: { totalRsvps: 0, totalPlusOnes: 0 },
          error: 'Database query failed',
        })
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
      code: (error as any)?.code,
    })
    
    // Return a more helpful error in development, generic in production
    const errorMessage = error?.message || 'Unknown error'
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: isDevelopment ? errorMessage : undefined,
        hint: errorMessage?.includes('prisma') || errorMessage?.includes('column') 
          ? 'Database schema mismatch. Run migrations: npx prisma migrate deploy' 
          : undefined
      },
      { status: 500 }
    )
  }
}
