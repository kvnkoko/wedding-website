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
    const { question, answer, colorHexCodes, inviteLinkConfigId, order } = body

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

    const faq = await prisma.fAQ.update({
      where: { id: params.id },
      data: {
        question,
        answer,
        colorHexCodes: colorHexCodesJson !== undefined ? colorHexCodesJson : undefined,
        inviteLinkConfigId: inviteLinkConfigId || null,
        order: order !== undefined ? order : undefined,
      },
      include: {
        inviteLinkConfig: {
          select: {
            slug: true,
            label: true,
          },
        },
      },
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

