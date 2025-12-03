import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Prevent execution during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 })
  }

  try {
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
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

