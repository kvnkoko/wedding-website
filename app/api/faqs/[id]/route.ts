import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PUT - Update FAQ (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { question, answer, colorHexCodes, eventIds, order } = body

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    // Validate colorHexCodes if provided
    let colorHexCodesJson: string | null = null
    if (colorHexCodes) {
      if (Array.isArray(colorHexCodes)) {
        // Validate each hex code
        const validHexCodes = colorHexCodes.filter((code: string) => 
          /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(code)
        )
        if (validHexCodes.length > 0) {
          colorHexCodesJson = JSON.stringify(validHexCodes)
        }
      }
    } else if (colorHexCodes === null || colorHexCodes === '') {
      colorHexCodesJson = null
    }

    // Validate eventIds if provided
    let finalEventIds: string[] = []
    if (eventIds && Array.isArray(eventIds) && eventIds.length > 0) {
      // Validate that all event IDs exist
      const existingEvents = await prisma.event.findMany({
        where: { id: { in: eventIds } },
        select: { id: true },
      })
      const existingEventIds = existingEvents.map(e => e.id)
      const invalidEventIds = eventIds.filter((id: string) => !existingEventIds.includes(id))
      
      if (invalidEventIds.length > 0) {
        return NextResponse.json(
          { error: 'Invalid event IDs', details: `Events with IDs ${invalidEventIds.join(', ')} not found` },
          { status: 400 }
        )
      }
      finalEventIds = eventIds
    }

    // Update FAQ and events in a transaction
    const faq = await prisma.$transaction(async (tx) => {
      // Delete existing FAQ events
      await tx.fAQEvent.deleteMany({
        where: { faqId: params.id },
      })

      // Update FAQ
      const updatedFAQ = await tx.fAQ.update({
        where: { id: params.id },
        data: {
          question,
          answer,
          colorHexCodes: colorHexCodesJson !== undefined ? colorHexCodesJson : undefined,
          inviteLinkConfigId: null, // Always null (using events instead)
          order: order !== undefined ? order : undefined,
          events: finalEventIds.length > 0 ? {
            create: finalEventIds.map((eventId: string) => ({
              eventId,
            })),
          } : undefined,
        },
        include: {
          events: {
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

      return updatedFAQ
    })

    // Parse colorHexCodes JSON string to array
    let parsedColors = null
    if (faq.colorHexCodes) {
      try {
        parsedColors = JSON.parse(faq.colorHexCodes)
      } catch (parseError) {
        console.error('Error parsing colorHexCodes:', parseError)
        parsedColors = null
      }
    }
    const faqWithParsedColors = {
      ...faq,
      colorHexCodes: parsedColors,
    }

    return NextResponse.json({ success: true, faq: faqWithParsedColors })
  } catch (error: any) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

