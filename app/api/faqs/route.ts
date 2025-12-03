import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Fetch FAQs (public endpoint, filtered by invite link if provided)
export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError: any) {
      console.error('Database connection test failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError.message },
        { status: 500 }
      )
    }

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

    // Parse colorHexCodes JSON strings to arrays
    const faqsWithParsedColors = faqs.map(faq => {
      let parsedColors = null
      if (faq.colorHexCodes) {
        try {
          parsedColors = JSON.parse(faq.colorHexCodes)
        } catch (parseError) {
          console.error('Error parsing colorHexCodes for FAQ:', faq.id, parseError)
          // If parsing fails, set to null
          parsedColors = null
        }
      }
      return {
        ...faq,
        colorHexCodes: parsedColors,
      }
    })

    return NextResponse.json(faqsWithParsedColors)
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
    const { question, answer, colorHexCodes, inviteLinkConfigId, order } = body

    console.log('Creating FAQ with data:', { question, answer, colorHexCodes, inviteLinkConfigId, order })

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
    }

    // Get the highest order number
    let newOrder = 0
    try {
      const lastFAQ = await prisma.fAQ.findFirst({
        orderBy: { order: 'desc' },
      })
      newOrder = order !== undefined ? order : (lastFAQ ? lastFAQ.order + 1 : 0)
    } catch (orderError: any) {
      console.error('Error getting last FAQ order:', orderError)
      // Continue with order 0 if there's an error
    }

    // Validate inviteLinkConfigId if provided
    let finalInviteLinkConfigId: string | null = null
    if (inviteLinkConfigId) {
      // Check if the invite link config exists
      const inviteLinkConfig = await prisma.inviteLinkConfig.findUnique({
        where: { id: inviteLinkConfigId },
      })
      if (!inviteLinkConfig) {
        return NextResponse.json(
          { error: 'Invalid invite link configuration ID', details: `Invite link with ID ${inviteLinkConfigId} not found` },
          { status: 400 }
        )
      }
      finalInviteLinkConfigId = inviteLinkConfigId
    }

    console.log('Creating FAQ with order:', newOrder, 'colorHexCodesJson:', colorHexCodesJson, 'inviteLinkConfigId:', finalInviteLinkConfigId)
    console.log('Data to create:', {
      question,
      answer,
      colorHexCodes: colorHexCodesJson,
      inviteLinkConfigId: finalInviteLinkConfigId,
      order: newOrder,
    })

    let faq
    try {
      // Build data object conditionally
      const createData: any = {
        question,
        answer,
        order: newOrder,
      }
      
      // Only include colorHexCodes if it's not null
      if (colorHexCodesJson !== null) {
        createData.colorHexCodes = colorHexCodesJson
      }
      
      // Only include inviteLinkConfigId if it's not null
      if (finalInviteLinkConfigId !== null) {
        createData.inviteLinkConfigId = finalInviteLinkConfigId
      }
      
      console.log('Final create data:', createData)
      
      faq = await prisma.fAQ.create({
        data: createData,
        include: {
          inviteLinkConfig: {
            select: {
              slug: true,
              label: true,
            },
          },
        },
      })
    } catch (createError: any) {
      console.error('Prisma create error:', createError)
      console.error('Error code:', createError.code)
      console.error('Error meta:', createError.meta)
      console.error('Error message:', createError.message)
      console.error('Full error:', JSON.stringify(createError, null, 2))
      throw createError
    }

    console.log('FAQ created successfully:', faq.id)

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
    console.error('Error creating FAQ:', error)
    console.error('Error stack:', error.stack)
    console.error('Error name:', error.name)
    console.error('Error code:', error.code)
    
    // Check if it's a Prisma error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A FAQ with this information already exists', details: error.message },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid invite link configuration. The selected event/invite link does not exist.', details: error.message },
        { status: 400 }
      )
    }
    
    if (error.message?.includes('Unknown arg') || error.message?.includes('colorHexCodes')) {
      return NextResponse.json(
        { error: 'Database schema error. Please run: npx prisma db push', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message || String(error), code: error.code, name: error.name },
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

