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

    const rsvps = await prisma.rsvp.findMany({
      where,
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
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Generate CSV
    const headers = [
      'Name',
      'Phone',
      'Email',
      'Side',
      'Plus One',
      'Plus One Name',
      'Plus One Relation',
      'Dietary Requirements',
      'Notes',
      'Invite Link',
      'Event Responses',
      'Created At',
    ]

    const rows = rsvps.map((rsvp) => {
      const eventResponses = rsvp.eventResponses
        .map((er) => `${er.event.name}: ${er.status}`)
        .join('; ')

      return [
        rsvp.name,
        rsvp.phone,
        rsvp.email || '',
        rsvp.side,
        rsvp.plusOne ? 'Yes' : 'No',
        rsvp.plusOneName || '',
        rsvp.plusOneRelation || '',
        rsvp.dietaryRequirements || '',
        rsvp.notes || '',
        rsvp.inviteLinkConfig.slug,
        eventResponses,
        rsvp.createdAt.toISOString(),
      ]
    })

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="rsvps-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting RSVPs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

