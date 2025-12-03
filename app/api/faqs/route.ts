import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Fetch FAQs (public endpoint, filtered by invite link if provided)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inviteLinkSlug = searchParams.get('inviteLinkSlug')

    let where: any = {}

    if (inviteLinkSlug) {
      // Get the invite link config ID
      const inviteLinkConfig = await prisma.inviteLinkConfig.findUnique({
        where: { slug: inviteLinkSlug },
      })

      if (inviteLinkConfig) {
        // Get FAQs for this specific invite link OR global FAQs (null inviteLinkConfigId)
        where = {
          OR: [
            { inviteLinkConfigId: inviteLinkConfig.id },
            { inviteLinkConfigId: null },
          ],
        }
      } else {
        // If invite link doesn't exist, only show global FAQs
        where = { inviteLinkConfigId: null }
      }
    } else {
      // No invite link provided, only show global FAQs
      where = { inviteLinkConfigId: null }
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        inviteLinkConfig: {
          select: {
            slug: true,
            label: true,
          },
        },
      },
    })

    return NextResponse.json(faqs)
  } catch (error: any) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create FAQ (admin only)
export async function POST(request: NextRequest) {
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

    // Get the highest order number
    const lastFAQ = await prisma.fAQ.findFirst({
      orderBy: { order: 'desc' },
    })
    const newOrder = order !== undefined ? order : (lastFAQ ? lastFAQ.order + 1 : 0)

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        inviteLinkConfigId: inviteLinkConfigId || null,
        order: newOrder,
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
    console.error('Error creating FAQ:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update FAQ order (admin only)
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { faqs } = body // Array of { id, order } objects

    if (!Array.isArray(faqs)) {
      return NextResponse.json(
        { error: 'FAQs array is required' },
        { status: 400 }
      )
    }

    // Update all FAQs in a transaction
    await prisma.$transaction(
      faqs.map((f: { id: string; order: number }) =>
        prisma.fAQ.update({
          where: { id: f.id },
          data: { order: f.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating FAQ order:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete FAQ (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      )
    }

    await prisma.fAQ.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

