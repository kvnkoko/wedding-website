import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Get FAQ events (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const faqEvents = await prisma.fAQEvent.findMany({
      where: { faqId: params.id },
      select: {
        eventId: true,
      },
    })

    return NextResponse.json(faqEvents)
  } catch (error: any) {
    console.error('Error fetching FAQ events:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

