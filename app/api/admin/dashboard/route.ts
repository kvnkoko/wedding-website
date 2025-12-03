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
        rsvpResponses: true,
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
      const maybeCount = responses.filter((r) => r.status === 'MAYBE').length

      // Count plus-ones for YES responses
      const yesRsvps = allRsvps.filter((rsvp) =>
        rsvp.eventResponses.some(
          (er) => er.eventId === event.id && er.status === 'YES'
        )
      )
      const plusOnes = yesRsvps.filter((r) => r.plusOne).length
      const totalAttendees = yesCount + plusOnes

      return {
        eventId: event.id,
        eventName: event.name,
        capacity: event.capacity,
        yes: yesCount,
        no: noCount,
        maybe: maybeCount,
        totalAttendees,
        plusOnes,
      }
    })

    const totalRsvps = allRsvps.length
    const totalPlusOnes = allRsvps.filter((r) => r.plusOne).length

    return NextResponse.json({
      stats,
      totals: {
        totalRsvps,
        totalPlusOnes,
      },
    })
  } catch (error) {
    // During build, catch any errors and return empty data
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        stats: [], 
        totals: { totalRsvps: 0, totalPlusOnes: 0 } 
      })
    }
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
