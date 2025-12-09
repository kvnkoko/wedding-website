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

    const events = await prisma.event.findMany({
      include: {
        rsvpResponses: {
          include: {
            rsvp: true,
          },
        },
      },
    })

    const allRsvps = await prisma.rsvp.findMany({
      include: {
        eventResponses: true,
      },
    })

    const stats = events.map((event) => {
      const responses = event.rsvpResponses
      const yesCount = responses.filter((r) => r.status === 'YES').length
      const noCount = responses.filter((r) => r.status === 'NO').length

      // Count plus-ones for YES responses (per-event plus ones)
      // Handle both old schema (no plusOne field) and new schema (with plusOne field)
      let plusOnes = 0
      try {
        plusOnes = event.rsvpResponses.filter((r) => r.status === 'YES' && (r as any).plusOne === true).length
      } catch {
        // Fallback: if plusOne field doesn't exist, count from RSVP level (old behavior)
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
    // Count total plus ones across all events
    let totalPlusOnes = 0
    try {
      totalPlusOnes = events.reduce((sum, event) => {
        return sum + event.rsvpResponses.filter((r) => r.status === 'YES' && (r as any).plusOne === true).length
      }, 0)
    } catch {
      // Fallback: use old RSVP-level plusOne field
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
