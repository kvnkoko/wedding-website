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
    const { question, answer, inviteLinkConfigId, order } = body

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    const faq = await prisma.fAQ.update({
      where: { id: params.id },
      data: {
        question,
        answer,
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

    return NextResponse.json({ success: true, faq })
  } catch (error: any) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

