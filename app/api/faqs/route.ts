import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Fetch FAQs (public endpoint, filtered by invite link if provided)
export async function GET(request: NextRequest) {
  try {
    // Debug: Check database connection and table
    try {
      const tableCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "faqs"
      `
      console.log('[GET /api/faqs] Table count from raw query:', Number(tableCount[0]?.count || 0))
    } catch (rawError: any) {
      console.error('[GET /api/faqs] Raw query error:', rawError.message)
    }
    
    const { searchParams } = new URL(request.url)
    const inviteLinkSlug = searchParams.get('inviteLinkSlug')
    
    // Decode the slug in case it's URL-encoded (e.g., "Signing%20Ceremony" -> "Signing Ceremony")
    const decodedSlug = inviteLinkSlug ? decodeURIComponent(inviteLinkSlug) : null
    console.log('[GET /api/faqs] Raw inviteLinkSlug from query:', inviteLinkSlug)
    console.log('[GET /api/faqs] Decoded inviteLinkSlug:', decodedSlug)

    let where: any = {}

    // For admin pages, show all FAQs (no filtering)
    // For public pages, filter by invite link
    const isAdminRequest = request.headers.get('referer')?.includes('/admin')
    
    if (decodedSlug) {
      console.log('[GET /api/faqs] Looking up invite link with slug:', decodedSlug)
      // Get the invite link config with its events
      const inviteLinkConfig = await prisma.inviteLinkConfig.findUnique({
        where: { slug: decodedSlug },
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

      console.log('[GET /api/faqs] Found invite link config:', inviteLinkConfig ? { 
        id: inviteLinkConfig.id, 
        label: inviteLinkConfig.label,
        eventIds: inviteLinkConfig.events.map(e => e.event.id),
        eventNames: inviteLinkConfig.events.map(e => e.event.name)
      } : 'NOT FOUND')

      if (inviteLinkConfig && inviteLinkConfig.events.length > 0) {
        // Get event IDs from this invite link
        const currentEventIds = inviteLinkConfig.events.map(e => e.event.id)
        console.log('[GET /api/faqs] Current invite link ID:', inviteLinkConfig.id)
        console.log('[GET /api/faqs] Current invite link slug:', inviteLinkConfig.slug)
        console.log('[GET /api/faqs] Current invite link events:', currentEventIds)
        
        // Find all invite link configs that share at least one event with the current invite link
        // This should include the current invite link itself
        const relatedInviteLinkConfigs = await prisma.inviteLinkConfig.findMany({
          where: {
            events: {
              some: {
                eventId: {
                  in: currentEventIds,
                },
              },
            },
          },
          select: {
            id: true,
            slug: true,
          },
        })
        
        const relatedInviteLinkConfigIds = relatedInviteLinkConfigs.map(config => config.id)
        console.log('[GET /api/faqs] Found related invite link configs:', relatedInviteLinkConfigs.map(c => ({ id: c.id, slug: c.slug })))
        console.log('[GET /api/faqs] Related invite link config IDs:', relatedInviteLinkConfigIds)
        console.log('[GET /api/faqs] Current invite link ID in related list?', relatedInviteLinkConfigIds.includes(inviteLinkConfig.id))
        
        // CRITICAL: Always explicitly include the current invite link's ID
        // This ensures FAQs directly tied to this invite link are always included
        // Use a Set to deduplicate IDs
        const allInviteLinkConfigIds = Array.from(new Set([
          inviteLinkConfig.id, // Always include current invite link first
          ...relatedInviteLinkConfigIds, // Then add related ones
        ]))
        console.log('[GET /api/faqs] All invite link config IDs to search (deduplicated):', allInviteLinkConfigIds)
        console.log('[GET /api/faqs] Current invite link ID guaranteed in list?', allInviteLinkConfigIds.includes(inviteLinkConfig.id))
        
        // Get FAQs for:
        // 1. This specific invite link (explicitly included above)
        // 2. Any invite link configs that share events with this one
        // 3. Global FAQs (null inviteLinkConfigId)
        where = {
          OR: [
            { inviteLinkConfigId: { in: allInviteLinkConfigIds } },
            { inviteLinkConfigId: null },
          ],
        }
        console.log('[GET /api/faqs] Final where clause:', JSON.stringify(where))
        
        // Debug: Let's also check if there are any FAQs directly tied to this invite link
        const directFAQs = await prisma.fAQ.findMany({
          where: { inviteLinkConfigId: inviteLinkConfig.id },
          select: { id: true, question: true },
        })
        console.log('[GET /api/faqs] FAQs directly tied to current invite link:', directFAQs.length, directFAQs.map(f => ({ id: f.id, question: f.question.substring(0, 50) })))
      } else if (inviteLinkConfig) {
        // Invite link exists but has no events, show FAQs for this invite link and global
        where = {
          OR: [
            { inviteLinkConfigId: inviteLinkConfig.id },
            { inviteLinkConfigId: null },
          ],
        }
        console.log('[GET /api/faqs] Invite link has no events, showing FAQs for this invite link or global')
      } else {
        // If invite link doesn't exist, only show global FAQs
        console.log('[GET /api/faqs] Invite link not found, showing only global FAQs')
        where = { inviteLinkConfigId: null }
      }
    } else if (!isAdminRequest) {
      // No invite link provided and not admin - show ALL FAQs (both global and event-specific)
      // This allows event-specific FAQs to show up on the main FAQ page
      where = {} // Empty where clause means show all FAQs
    }
    // If admin request with no inviteLinkSlug, where stays empty (show all FAQs)

    let faqs
    try {
      // First, try to verify the table exists with a raw query
      try {
        await prisma.$queryRaw`SELECT 1 FROM "faqs" LIMIT 1`
      } catch (tableCheckError: any) {
        console.error('Table check failed:', tableCheckError.message)
        // If table doesn't exist, try to create it
        if (tableCheckError.message?.includes('does not exist') || tableCheckError.code === 'P2021') {
          console.log('Attempting to create FAQs table...')
          try {
            await prisma.$executeRawUnsafe(`
              CREATE TABLE IF NOT EXISTS "faqs" (
                "id" TEXT NOT NULL,
                "question" TEXT NOT NULL,
                "answer" TEXT NOT NULL,
                "colorHexCodes" TEXT,
                "inviteLinkConfigId" TEXT,
                "order" INTEGER NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
              )
            `)
            await prisma.$executeRawUnsafe(`
              ALTER TABLE "faqs" ADD CONSTRAINT IF NOT EXISTS "faqs_inviteLinkConfigId_fkey" 
              FOREIGN KEY ("inviteLinkConfigId") REFERENCES "invite_link_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE
            `).catch(() => {}) // Ignore if constraint already exists
            console.log('FAQs table created successfully')
          } catch (createError: any) {
            console.error('Failed to create table:', createError.message)
            return NextResponse.json(
              { error: 'FAQs table not found and could not be created. Please run: npx prisma db push', details: createError.message },
              { status: 500 }
            )
          }
        }
      }
      
      console.log('[GET /api/faqs] Querying with where clause:', JSON.stringify(where))
      
      // Query FAQs with the where clause
      faqs = await prisma.fAQ.findMany({
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
      
      console.log('[GET /api/faqs] Found FAQs:', faqs.length)
      console.log('[GET /api/faqs] FAQ details:', faqs.map(f => ({ 
        id: f.id, 
        question: f.question.substring(0, 50),
        inviteLinkConfigId: f.inviteLinkConfigId,
        inviteLinkConfig: f.inviteLinkConfig ? { slug: f.inviteLinkConfig.slug, label: f.inviteLinkConfig.label } : null
      })))
      
      // If we have an invite link config, double-check that we got FAQs directly tied to it
      if (decodedSlug && inviteLinkConfig) {
        const directFAQsCount = faqs.filter(f => f.inviteLinkConfigId === inviteLinkConfig.id).length
        console.log('[GET /api/faqs] FAQs directly tied to current invite link in results:', directFAQsCount)
        
        // If no direct FAQs found, query them separately to debug
        if (directFAQsCount === 0) {
          const directFAQsCheck = await prisma.fAQ.findMany({
            where: { inviteLinkConfigId: inviteLinkConfig.id },
            select: { id: true, question: true, order: true },
          })
          console.log('[GET /api/faqs] DEBUG: Direct query for current invite link FAQs found:', directFAQsCheck.length)
          if (directFAQsCheck.length > 0) {
            console.log('[GET /api/faqs] DEBUG: These FAQs exist but were not included:', directFAQsCheck.map(f => ({ id: f.id, question: f.question.substring(0, 50) })))
          }
        }
      }
    } catch (queryError: any) {
      console.error('Error querying FAQs:', queryError)
      console.error('Error code:', queryError.code)
      console.error('Error message:', queryError.message)
      
      // If it's a table doesn't exist error, provide helpful message
      if (queryError.message?.includes('does not exist') || queryError.code === 'P2021') {
        return NextResponse.json(
          { error: 'FAQs table not found. Please run: npx prisma db push', details: queryError.message },
          { status: 500 }
        )
      }
      throw queryError
    }

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
    console.error('Error code:', error.code)
    console.error('Error name:', error.name)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message, code: error.code },
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
      console.log('[POST /api/faqs] Prisma client type:', typeof prisma.fAQ)
      console.log('[POST /api/faqs] Prisma client create type:', typeof prisma.fAQ.create)
      console.log('[POST /api/faqs] DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT SET')
      
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
      
      console.log('[POST /api/faqs] FAQ object returned from create:', faq)
      console.log('[POST /api/faqs] FAQ has id?', !!faq.id)
      
      // Immediately verify with a raw query
      try {
        const verifyRaw = await prisma.$queryRaw<Array<{ id: string; question: string }>>`
          SELECT id, question FROM "faqs" WHERE id = ${faq.id}
        `
        console.log('[POST /api/faqs] Verified FAQ in database:', verifyRaw.length > 0 ? 'YES' : 'NO')
        if (verifyRaw.length > 0) {
          console.log('[POST /api/faqs] Verified FAQ question:', verifyRaw[0].question)
        }
      } catch (verifyError: any) {
        console.error('[POST /api/faqs] Verification query failed:', verifyError.message)
      }
    } catch (createError: any) {
      console.error('Prisma create error:', createError)
      console.error('Error code:', createError.code)
      console.error('Error meta:', createError.meta)
      console.error('Error message:', createError.message)
      console.error('Full error:', JSON.stringify(createError, null, 2))
      throw createError
    }

    console.log('FAQ created successfully:', faq.id)
    
    // Verify it was actually saved by querying it back
    const verifyFAQ = await prisma.fAQ.findUnique({ where: { id: faq.id } })
    if (!verifyFAQ) {
      console.error('ERROR: FAQ was created but cannot be found in database!')
      throw new Error('FAQ creation failed - FAQ not found after creation')
    }
    console.log('Verified FAQ exists in database:', verifyFAQ.id)

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
      console.log('[DELETE /api/faqs] Unauthorized - no admin session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('[DELETE /api/faqs] Delete request for ID:', id)

    if (!id) {
      console.error('[DELETE /api/faqs] No ID provided')
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      )
    }

    // Check if FAQ exists first
    const existingFAQ = await prisma.fAQ.findUnique({
      where: { id },
    })

    if (!existingFAQ) {
      console.error('[DELETE /api/faqs] FAQ not found:', id)
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    console.log('[DELETE /api/faqs] Deleting FAQ:', existingFAQ.question)

    await prisma.fAQ.delete({
      where: { id },
    })

    console.log('[DELETE /api/faqs] FAQ deleted successfully:', id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[DELETE /api/faqs] Error deleting FAQ:', error)
    console.error('[DELETE /api/faqs] Error code:', error.code)
    console.error('[DELETE /api/faqs] Error message:', error.message)
    
    // Handle Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'FAQ not found', details: error.message },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

