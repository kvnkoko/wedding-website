import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const config = await prisma.inviteLinkConfig.findUnique({
      where: { slug: params.slug },
      include: {
        events: {
          include: {
            event: true,
          },
        },
      },
    })

    if (!config) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 })
    }

    const events = config.events.map((e) => e.event)

    return NextResponse.json({
      id: config.id,
      slug: config.slug,
      label: config.label,
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        dateTime: e.dateTime.toISOString(),
        venueName: e.venueName,
        city: e.city,
      })),
    })
  } catch (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

