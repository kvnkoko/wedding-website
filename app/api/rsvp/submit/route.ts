import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateEditToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      inviteLinkConfigId,
      name,
      phone,
      email,
      side,
      dietaryRequirements,
      notes,
      eventResponses,
    } = body

    console.log('RSVP submission received:', {
      hasInviteLinkConfigId: !!inviteLinkConfigId,
      hasName: !!name,
      hasPhone: !!phone,
      eventResponsesKeys: Object.keys(eventResponses || {}),
    })

    if (!inviteLinkConfigId || !name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the config exists
    const config = await prisma.inviteLinkConfig.findUnique({
      where: { id: inviteLinkConfigId },
      include: {
        events: {
          include: {
            event: true,
          },
        },
      },
    })

    if (!config) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 400 })
    }

    // Validate event responses match allowed events
    const allowedEventIds = config.events.map((e) => e.event.id)
    const responseEventIds = Object.keys(eventResponses || {})

    for (const eventId of responseEventIds) {
      if (!allowedEventIds.includes(eventId)) {
        return NextResponse.json(
          { error: 'Invalid event in response' },
          { status: 400 }
        )
      }
    }
    
    // Determine if there's any plus one (for backward compatibility)
    const hasAnyPlusOne = Object.values(eventResponses || {}).some((response: any) => 
      typeof response === 'object' && response?.plusOne === true
    )

    const editToken = generateEditToken()

    // Prepare event responses data with plus one information
    const eventResponsesData = Object.entries(eventResponses || {}).map(([eventId, response]) => {
      // Handle both old format (string) and new format (object)
      let status: string
      let plusOne = false
      let plusOneName: string | null = null
      let plusOneRelation: string | null = null
      let hasName = false
      let hasRelation = false
      
      if (typeof response === 'string') {
        status = response
      } else if (response && typeof response === 'object' && 'status' in response) {
        status = (response as any).status
        plusOneName = (response as any).plusOneName || null
        plusOneRelation = (response as any).plusOneRelation || null
        // Set plusOne to true if there's a name OR relation, even if the boolean wasn't set
        // Also handle string "true"/"false" from checkbox
        const plusOneValue = (response as any).plusOne
        const plusOneBool = plusOneValue === true || plusOneValue === 'true' || plusOneValue === 'on' || plusOneValue === 1
        hasName = Boolean(plusOneName && 
                 String(plusOneName).trim() !== '' && 
                 String(plusOneName).trim() !== 'null' &&
                 String(plusOneName).trim().toLowerCase() !== 'none')
        hasRelation = Boolean(plusOneRelation && 
                     String(plusOneRelation).trim() !== '' && 
                     String(plusOneRelation).trim() !== 'null' &&
                     String(plusOneRelation).trim().toLowerCase() !== 'none')
        plusOne = plusOneBool || hasName || hasRelation || false
        
        console.log(`[Submit] Processing event ${eventId}:`, {
          status,
          plusOneValue,
          plusOneBool,
          plusOneName,
          plusOneRelation,
          hasName,
          hasRelation,
          finalPlusOne: plusOne,
          rawResponse: response,
        })
      } else {
        console.error('Invalid response format:', response)
        throw new Error(`Invalid event response format for event ${eventId}`)
      }
      
      // Always include Plus One data if it exists, even if plusOne flag is false
      const finalPlusOneName = hasName ? String(plusOneName).trim() : null
      const finalPlusOneRelation = hasRelation ? String(plusOneRelation).trim() : null
      
      // Set plusOne to true if we have name or relation, even if flag wasn't set
      const finalPlusOne = Boolean(plusOne || finalPlusOneName || finalPlusOneRelation)
      
      return {
        eventId,
        status: status,
        plusOne: finalPlusOne,
        plusOneName: finalPlusOneName,
        plusOneRelation: finalPlusOneRelation,
      }
    })

    console.log('Creating RSVP:', {
      inviteLinkConfigId,
      name,
      phone,
      email,
      side,
      eventResponsesCount: eventResponsesData.length,
      sampleResponse: eventResponsesData[0],
      allEventResponses: eventResponsesData.map(r => ({
        eventId: r.eventId,
        status: r.status,
        plusOne: r.plusOne,
        plusOneName: r.plusOneName,
        plusOneRelation: r.plusOneRelation,
      })),
    })

    // Create RSVP
    let rsvp
    try {
      // Ensure all event response data is valid
      if (!eventResponsesData || eventResponsesData.length === 0) {
        throw new Error('No event responses provided')
      }

      // Validate all statuses are valid
      const validStatuses = ['YES', 'NO', 'MAYBE']
      for (const response of eventResponsesData) {
        if (!validStatuses.includes(response.status)) {
          throw new Error(`Invalid status: ${response.status} for event ${response.eventId}`)
        }
      }

      // Check if the new schema columns exist AND get actual column names
      let hasNewSchema = false
      let actualColumnNames: { rsvpId: string; eventId: string; status: string; createdAt: string; updatedAt: string } | null = null
      
      // More robust schema detection - check for all three columns (both camelCase and snake_case)
      try {
        const schemaCheck = await prisma.$queryRaw<Array<{ column_name: string }>>`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'rsvp_event_responses' 
          AND column_name IN ('plusOne', 'plus_one', 'plusOneName', 'plus_one_name', 'plusOneRelation', 'plus_one_relation')
          LIMIT 6
        `
        // Check if we have all three columns (either camelCase or snake_case)
        const foundPlusOne = schemaCheck.some(c => c.column_name === 'plusOne' || c.column_name === 'plus_one')
        const foundPlusOneName = schemaCheck.some(c => c.column_name === 'plusOneName' || c.column_name === 'plus_one_name')
        const foundPlusOneRelation = schemaCheck.some(c => c.column_name === 'plusOneRelation' || c.column_name === 'plus_one_relation')
        hasNewSchema = foundPlusOne && foundPlusOneName && foundPlusOneRelation
        console.log('Schema detection result:', {
          foundColumns: schemaCheck,
          hasNewSchema: hasNewSchema,
          foundPlusOne,
          foundPlusOneName,
          foundPlusOneRelation,
          columnCount: schemaCheck?.length || 0,
        })
      } catch (schemaCheckError: any) {
        hasNewSchema = false
        console.log('Schema detection error (assuming old schema):', schemaCheckError?.message)
        
        // Get actual column names from the database
        try {
          const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'rsvp_event_responses'
            ORDER BY ordinal_position
          `
          
          console.log('Actual columns in rsvp_event_responses:', columns.map(c => c.column_name))
          
          // Find columns - try different naming conventions
          const rsvpIdCol = columns.find(c => 
            c.column_name.toLowerCase() === 'rsvpid' || 
            c.column_name.toLowerCase() === 'rsvp_id' ||
            c.column_name === 'rsvpId'
          )?.column_name
          
          const eventIdCol = columns.find(c => 
            c.column_name.toLowerCase() === 'eventid' || 
            c.column_name.toLowerCase() === 'event_id' ||
            c.column_name === 'eventId'
          )?.column_name
          
          const statusCol = columns.find(c => c.column_name.toLowerCase() === 'status')?.column_name
          const createdAtCol = columns.find(c => 
            c.column_name === 'createdAt' ||
            c.column_name.toLowerCase() === 'createdat' ||
            c.column_name.toLowerCase().includes('created')
          )?.column_name
          const updatedAtCol = columns.find(c => 
            c.column_name === 'updatedAt' ||
            c.column_name.toLowerCase() === 'updatedat' ||
            c.column_name.toLowerCase().includes('updated')
          )?.column_name
          
          if (rsvpIdCol && eventIdCol && statusCol && createdAtCol && updatedAtCol) {
            actualColumnNames = {
              rsvpId: rsvpIdCol,
              eventId: eventIdCol,
              status: statusCol,
              createdAt: createdAtCol,
              updatedAt: updatedAtCol,
            }
            console.log('Using detected column names:', actualColumnNames)
          } else {
            console.warn('Could not find all required columns. Using defaults. Found:', { rsvpIdCol, eventIdCol, statusCol, createdAtCol, updatedAtCol })
            // Try camelCase first (Prisma default), then snake_case
            actualColumnNames = {
              rsvpId: rsvpIdCol || 'rsvpId',
              eventId: eventIdCol || 'eventId',
              status: statusCol || 'status',
              createdAt: createdAtCol || 'createdAt',
              updatedAt: updatedAtCol || 'updatedAt',
            }
          }
        } catch (columnCheckError: any) {
          console.warn('Could not query column names, using camelCase defaults:', columnCheckError?.message)
          // Use camelCase defaults (Prisma default naming)
          actualColumnNames = {
            rsvpId: 'rsvpId',
            eventId: 'eventId',
            status: 'status',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
          }
        }
      }

      // Create RSVP and event responses in a transaction
      rsvp = await prisma.$transaction(async (tx) => {
        // First create the RSVP
        const newRsvp = await tx.rsvp.create({
      data: {
        inviteLinkConfigId,
        name,
        phone,
        email: email || null,
        side,
            plusOne: hasAnyPlusOne || false,
            plusOneName: null,
            plusOneRelation: null,
        dietaryRequirements: dietaryRequirements || null,
        notes: notes || null,
        editToken,
          },
        })

        // Create event responses - use the schema we detected
        if (hasNewSchema) {
          // New schema - include plus one fields using Prisma
          const eventResponseData = eventResponsesData.map((responseData) => {
            // Ensure plusOne is true if there's a name OR relation
            const hasName = responseData.plusOneName && 
                           String(responseData.plusOneName).trim() !== '' && 
                           String(responseData.plusOneName).trim() !== 'null'
            const hasRelation = responseData.plusOneRelation && 
                               String(responseData.plusOneRelation).trim() !== '' && 
                               String(responseData.plusOneRelation).trim() !== 'null'
            // Use the plusOne flag from responseData (already computed) OR check for name/relation
            const plusOne = Boolean(responseData.plusOne || hasName || hasRelation || false)
            
            const data = {
              rsvpId: newRsvp.id,
              eventId: responseData.eventId,
              status: responseData.status,
              plusOne: plusOne,
              plusOneName: hasName ? String(responseData.plusOneName).trim() : null,
              plusOneRelation: hasRelation ? String(responseData.plusOneRelation).trim() : null,
            }
            
            console.log(`[Submit] Creating event response for event ${responseData.eventId}:`, {
              original: responseData,
              hasName,
              hasRelation,
              processed: data,
              willSavePlusOne: data.plusOne,
              willSavePlusOneName: data.plusOneName,
              willSavePlusOneRelation: data.plusOneRelation,
            })
            
            return data
          })
          
          console.log('Creating event responses with plus one data:', {
            count: eventResponseData.length,
            sample: eventResponseData[0],
            allWithPlusOne: eventResponseData.filter(r => r.plusOne || r.plusOneName),
            allData: eventResponseData.map(r => ({
              eventId: r.eventId,
              status: r.status,
              plusOne: r.plusOne,
              plusOneName: r.plusOneName,
              plusOneRelation: r.plusOneRelation,
            })),
          })
          
          try {
            await tx.rsvpEventResponse.createMany({
              data: eventResponseData,
            })
            console.log('✅ SUCCESS: createMany completed for new schema')
          } catch (createError: any) {
            console.error('❌ ERROR: createMany failed for new schema:', {
              error: createError.message,
              code: createError.code,
              meta: createError.meta,
              data: eventResponseData,
            })
            throw createError
          }
          
          console.log('✅ Created event responses with createMany, data:', JSON.stringify(eventResponseData, null, 2))
          
          // Verify data was saved correctly - use raw query to see actual database values
          // First detect actual column names
          let verifyData: any[] = []
          try {
            const columns = await tx.$queryRaw<Array<{ column_name: string }>>`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'rsvp_event_responses'
              ORDER BY ordinal_position
            `
            
            const eventIdCol = columns.find(c => c.column_name === 'eventId' || c.column_name.toLowerCase() === 'eventid' || c.column_name.toLowerCase() === 'event_id')?.column_name || 'eventId'
            const statusCol = columns.find(c => c.column_name.toLowerCase() === 'status')?.column_name || 'status'
            const rsvpIdCol = columns.find(c => c.column_name === 'rsvpId' || c.column_name.toLowerCase() === 'rsvpid' || c.column_name.toLowerCase() === 'rsvp_id')?.column_name || 'rsvpId'
            const plusOneCol = columns.find(c => c.column_name === 'plusOne' || c.column_name === 'plus_one')?.column_name
            const plusOneNameCol = columns.find(c => c.column_name === 'plusOneName' || c.column_name === 'plus_one_name')?.column_name
            const plusOneRelationCol = columns.find(c => c.column_name === 'plusOneRelation' || c.column_name === 'plus_one_relation')?.column_name
            
            if (plusOneCol && plusOneNameCol && plusOneRelationCol) {
              verifyData = await tx.$queryRawUnsafe<Array<any>>(
                `SELECT "${eventIdCol}" as "eventId", "${statusCol}" as status, "${plusOneCol}" as "plusOne", "${plusOneNameCol}" as "plusOneName", "${plusOneRelationCol}" as "plusOneRelation"
                 FROM rsvp_event_responses 
                 WHERE "${rsvpIdCol}" = $1`,
                newRsvp.id
              )
            } else {
              verifyData = await tx.$queryRawUnsafe<Array<any>>(
                `SELECT "${eventIdCol}" as "eventId", "${statusCol}" as status
                 FROM rsvp_event_responses 
                 WHERE "${rsvpIdCol}" = $1`,
                newRsvp.id
              )
            }
            console.log('✅ RAW DATABASE VALUES (New Schema):', JSON.stringify(verifyData, null, 2))
          } catch (e) {
            console.error('Error verifying saved data:', e)
          }
          
          // Also verify with Prisma
          const prismaVerify = await tx.rsvpEventResponse.findMany({
            where: { rsvpId: newRsvp.id },
            select: {
              eventId: true,
              status: true,
              plusOne: true,
              plusOneName: true,
              plusOneRelation: true,
            },
          })
          console.log('✅ VERIFIED SAVED EVENT RESPONSES (Prisma):', JSON.stringify(prismaVerify, null, 2))
        } else {
          // Old schema - use raw SQL with actual column names
          // If we couldn't detect column names, use camelCase defaults (Prisma default)
          if (!actualColumnNames) {
            console.warn('Could not determine actual column names, using camelCase defaults')
            actualColumnNames = {
              rsvpId: 'rsvpId',
              eventId: 'eventId',
              status: 'status',
              createdAt: 'createdAt',
              updatedAt: 'updatedAt',
            }
          }
          
          // Check if plus_one columns exist in old schema - check both camelCase and snake_case
          let hasPlusOneColumns = false
          try {
            const plusOneCheck = await tx.$queryRaw<Array<{ column_name: string }>>`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'rsvp_event_responses' 
              AND column_name IN ('plusOne', 'plus_one', 'plusOneName', 'plus_one_name', 'plusOneRelation', 'plus_one_relation')
              LIMIT 6
            `
            // Check if we have all three columns (either camelCase or snake_case)
            const foundPlusOne = plusOneCheck.some(c => c.column_name === 'plusOne' || c.column_name === 'plus_one')
            const foundPlusOneName = plusOneCheck.some(c => c.column_name === 'plusOneName' || c.column_name === 'plus_one_name')
            const foundPlusOneRelation = plusOneCheck.some(c => c.column_name === 'plusOneRelation' || c.column_name === 'plus_one_relation')
            hasPlusOneColumns = foundPlusOne && foundPlusOneName && foundPlusOneRelation
            console.log('Plus one columns check:', { foundPlusOne, foundPlusOneName, foundPlusOneRelation, hasPlusOneColumns, foundColumns: plusOneCheck })
          } catch (e) {
            console.warn('Error checking plus_one columns:', e)
            hasPlusOneColumns = false
          }
          
          console.log('Old schema path - hasPlusOneColumns:', hasPlusOneColumns)
          for (const responseData of eventResponsesData) {
            if (hasPlusOneColumns) {
              // Include plus one fields if columns exist
              console.log('Inserting with plus one data:', {
                eventId: responseData.eventId,
                status: responseData.status,
                plusOne: responseData.plusOne,
                plusOneName: responseData.plusOneName,
                plusOneRelation: responseData.plusOneRelation,
              })
              // Use actual column names for plus_one fields - try camelCase first
              const plusOneCol = (actualColumnNames as any).plusOne || 'plusOne'
              const plusOneNameCol = (actualColumnNames as any).plusOneName || 'plusOneName'
              const plusOneRelationCol = (actualColumnNames as any).plusOneRelation || 'plusOneRelation'
              
              const plusOneValue = Boolean(responseData.plusOne || (responseData.plusOneName && responseData.plusOneName.trim() !== ''))
              const plusOneNameValue = responseData.plusOneName?.trim() || null
              const plusOneRelationValue = responseData.plusOneRelation?.trim() || null
              
              // Detect actual plus_one column names from database
              let detectedPlusOneCol = plusOneCol
              let detectedPlusOneNameCol = plusOneNameCol
              let detectedPlusOneRelationCol = plusOneRelationCol
              
              try {
                const plusOneCols = await tx.$queryRaw<Array<{ column_name: string }>>`
                  SELECT column_name 
                  FROM information_schema.columns 
                  WHERE table_name = 'rsvp_event_responses' 
                  AND column_name IN ('plusOne', 'plus_one', 'plusOneName', 'plus_one_name', 'plusOneRelation', 'plus_one_relation')
                `
                
                const foundPlusOne = plusOneCols.find(c => c.column_name === 'plusOne' || c.column_name === 'plus_one')
                const foundPlusOneName = plusOneCols.find(c => c.column_name === 'plusOneName' || c.column_name === 'plus_one_name')
                const foundPlusOneRelation = plusOneCols.find(c => c.column_name === 'plusOneRelation' || c.column_name === 'plus_one_relation')
                
                detectedPlusOneCol = foundPlusOne?.column_name || plusOneCol
                detectedPlusOneNameCol = foundPlusOneName?.column_name || plusOneNameCol
                detectedPlusOneRelationCol = foundPlusOneRelation?.column_name || plusOneRelationCol
                
                console.log('Using detected plus_one column names:', { detectedPlusOneCol, detectedPlusOneNameCol, detectedPlusOneRelationCol })
              } catch (e) {
                console.warn('Could not detect plus_one column names, using defaults:', e)
              }
              
              console.log(`[Submit] Inserting event response ${responseData.eventId} with plus one:`, {
                plusOne: plusOneValue,
                plusOneName: plusOneNameValue,
                plusOneRelation: plusOneRelationValue,
                usingColumns: { detectedPlusOneCol, detectedPlusOneNameCol, detectedPlusOneRelationCol },
              })
              
              await tx.$executeRawUnsafe(
                `INSERT INTO rsvp_event_responses (id, "${actualColumnNames.rsvpId}", "${actualColumnNames.eventId}", "${actualColumnNames.status}", "${detectedPlusOneCol}", "${detectedPlusOneNameCol}", "${detectedPlusOneRelationCol}", "${actualColumnNames.createdAt}", "${actualColumnNames.updatedAt}") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                newRsvp.id,
                responseData.eventId,
                responseData.status,
                plusOneValue,
                plusOneNameValue,
                plusOneRelationValue
              )
              
              // Verify immediately after insert
              const justInserted = await tx.$queryRawUnsafe<Array<any>>(
                `SELECT "${actualColumnNames.eventId}" as "eventId", "${actualColumnNames.status}" as status, "${detectedPlusOneCol}" as "plusOne", "${detectedPlusOneNameCol}" as "plusOneName", "${detectedPlusOneRelationCol}" as "plusOneRelation"
                 FROM rsvp_event_responses 
                 WHERE "${actualColumnNames.rsvpId}" = $1 AND "${actualColumnNames.eventId}" = $2
                 ORDER BY "${actualColumnNames.createdAt}" DESC
                 LIMIT 1`,
                newRsvp.id,
                responseData.eventId
              )
              console.log(`✅ VERIFIED INSERTED DATA for event ${responseData.eventId}:`, JSON.stringify(justInserted, null, 2))
            } else {
              // Use the actual column names we detected (no plus one columns)
              console.log('Inserting without plus one columns (old schema):', {
                eventId: responseData.eventId,
                status: responseData.status,
              })
              await tx.$executeRawUnsafe(
                `INSERT INTO rsvp_event_responses (id, "${actualColumnNames.rsvpId}", "${actualColumnNames.eventId}", "${actualColumnNames.status}", "${actualColumnNames.createdAt}", "${actualColumnNames.updatedAt}") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW())`,
                newRsvp.id,
                responseData.eventId,
                responseData.status
              )
            }
          }
        }

        // Fetch the complete RSVP with relations
        // Explicitly include Plus One fields to ensure they're returned
        if (hasNewSchema) {
          return await tx.rsvp.findUnique({
            where: { id: newRsvp.id },
            include: {
              eventResponses: {
                include: {
                  event: true,
                },
              },
            },
          })
        } else {
          // Old schema - manually fetch, but check if plus_one columns exist
          const fetchedRsvp = await tx.rsvp.findUnique({
            where: { id: newRsvp.id },
          })
          
          // Check if plus_one columns exist in old schema - check both camelCase and snake_case
          let hasPlusOneColumns = false
          let plusOneCol = 'plusOne'
          let plusOneNameCol = 'plusOneName'
          let plusOneRelationCol = 'plusOneRelation'
          
          try {
            const plusOneCheck = await tx.$queryRaw<Array<{ column_name: string }>>`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'rsvp_event_responses' 
              AND column_name IN ('plusOne', 'plus_one', 'plusOneName', 'plus_one_name', 'plusOneRelation', 'plus_one_relation')
              LIMIT 6
            `
            // Check if we have all three columns (either camelCase or snake_case)
            const foundPlusOne = plusOneCheck.find(c => c.column_name === 'plusOne' || c.column_name === 'plus_one')
            const foundPlusOneName = plusOneCheck.find(c => c.column_name === 'plusOneName' || c.column_name === 'plus_one_name')
            const foundPlusOneRelation = plusOneCheck.find(c => c.column_name === 'plusOneRelation' || c.column_name === 'plus_one_relation')
            hasPlusOneColumns = !!(foundPlusOne && foundPlusOneName && foundPlusOneRelation)
            
            if (hasPlusOneColumns) {
              plusOneCol = foundPlusOne!.column_name
              plusOneNameCol = foundPlusOneName!.column_name
              plusOneRelationCol = foundPlusOneRelation!.column_name
              console.log('[Submit] Old schema fetch - detected plus_one columns:', { plusOneCol, plusOneNameCol, plusOneRelationCol })
            }
            
            if (hasPlusOneColumns && actualColumnNames) {
              plusOneCol = (actualColumnNames as any).plusOne || 'plus_one'
              plusOneNameCol = (actualColumnNames as any).plusOneName || 'plus_one_name'
              plusOneRelationCol = (actualColumnNames as any).plusOneRelation || 'plus_one_relation'
            }
          } catch {
            hasPlusOneColumns = false
          }
          
          console.log('[Submit] Old schema - fetching event responses, hasPlusOneColumns:', hasPlusOneColumns)
          
          // Manually fetch event responses using raw SQL with actual column names
          let responses: any[]
          if (hasPlusOneColumns) {
            responses = await tx.$queryRawUnsafe<Array<{
              id: string;
              rsvpId: string;
              eventId: string;
              status: string;
              plusOne?: boolean;
              plusOneName?: string | null;
              plusOneRelation?: string | null;
              createdAt: Date;
              updatedAt: Date;
            }>>(
              `SELECT id, "${actualColumnNames!.rsvpId}" as "rsvpId", "${actualColumnNames!.eventId}" as "eventId", 
                      "${actualColumnNames!.status}" as status,
                      "${plusOneCol}" as "plusOne", "${plusOneNameCol}" as "plusOneName", "${plusOneRelationCol}" as "plusOneRelation",
                      "${actualColumnNames!.createdAt}" as "createdAt", 
                      "${actualColumnNames!.updatedAt}" as "updatedAt"
               FROM rsvp_event_responses
               WHERE "${actualColumnNames!.rsvpId}" = $1`,
              newRsvp.id
            )
            console.log('[Submit] Old schema - fetched responses with plus one data:', responses)
          } else {
            responses = await tx.$queryRawUnsafe<Array<{
              id: string;
              rsvpId: string;
              eventId: string;
              status: string;
              createdAt: Date;
              updatedAt: Date;
            }>>(
              `SELECT id, "${actualColumnNames!.rsvpId}" as "rsvpId", "${actualColumnNames!.eventId}" as "eventId", 
                      "${actualColumnNames!.status}" as status, 
                      "${actualColumnNames!.createdAt}" as "createdAt", 
                      "${actualColumnNames!.updatedAt}" as "updatedAt"
               FROM rsvp_event_responses
               WHERE "${actualColumnNames!.rsvpId}" = $1`,
              newRsvp.id
            )
            console.log('[Submit] Old schema - fetched responses without plus one data:', responses)
          }
          
          // Fetch events for each response
          const eventIds = responses.map(r => r.eventId)
          const events = await tx.event.findMany({
            where: { id: { in: eventIds } },
          })
          
          return {
            ...fetchedRsvp,
            eventResponses: responses.map(r => {
              // Handle both camelCase and snake_case from raw query
              const plusOneRaw = (r as any).plusOne !== undefined ? (r as any).plusOne : ((r as any).plus_one !== undefined ? (r as any).plus_one : false)
              const plusOneNameRaw = (r as any).plusOneName !== undefined ? (r as any).plusOneName : ((r as any).plus_one_name !== undefined ? (r as any).plus_one_name : null)
              const plusOneRelationRaw = (r as any).plusOneRelation !== undefined ? (r as any).plusOneRelation : ((r as any).plus_one_relation !== undefined ? (r as any).plus_one_relation : null)
              
              const hasPlusOneName = plusOneNameRaw && String(plusOneNameRaw).trim() !== ''
              const plusOne = Boolean(plusOneRaw || hasPlusOneName || false)
              
              const mapped = {
                ...r,
                plusOne: plusOne,
                plusOneName: plusOneNameRaw ? String(plusOneNameRaw).trim() : null,
                plusOneRelation: plusOneRelationRaw ? String(plusOneRelationRaw).trim() : null,
                event: events.find(e => e.id === r.eventId)!,
              }
              
              console.log(`[Submit] Old schema - mapped event response for ${r.eventId}:`, {
                raw: r,
                mapped: mapped,
              })
              
              return mapped
            }),
          } as any
        }
      })
      
      if (!rsvp) {
        throw new Error('Failed to create RSVP')
      }
      
      console.log('RSVP created successfully:', rsvp.id)
    } catch (createError: any) {
      console.error('RSVP creation failed:', {
        message: createError?.message,
        code: createError?.code,
        meta: createError?.meta,
        stack: createError?.stack,
        eventResponsesData: eventResponsesData,
      })
      
      // Log the error but don't throw a generic message - let the actual error through
      console.error('RSVP creation error details:', {
        code: createError?.code,
        message: createError?.message,
        meta: createError?.meta,
      })
      
      throw createError
    }

    return NextResponse.json({
      id: rsvp.id,
      name: rsvp.name,
      phone: rsvp.phone,
      email: rsvp.email,
      side: rsvp.side,
      plusOne: rsvp.plusOne,
      plusOneName: rsvp.plusOneName,
      plusOneRelation: rsvp.plusOneRelation,
      dietaryRequirements: rsvp.dietaryRequirements,
      notes: rsvp.notes,
      editToken: rsvp.editToken,
      eventResponses: rsvp.eventResponses.map((er: any) => {
        // Handle both camelCase and snake_case field names
        // Also check for null/undefined explicitly - be very thorough
        const plusOneRaw = er.plusOne !== undefined && er.plusOne !== null ? er.plusOne : 
                          (er.plus_one !== undefined && er.plus_one !== null ? er.plus_one : false)
        const plusOneNameRaw = er.plusOneName !== undefined && er.plusOneName !== null ? er.plusOneName : 
                              (er.plus_one_name !== undefined && er.plus_one_name !== null ? er.plus_one_name : null)
        const plusOneRelationRaw = er.plusOneRelation !== undefined && er.plusOneRelation !== null ? er.plusOneRelation : 
                                  (er.plus_one_relation !== undefined && er.plus_one_relation !== null ? er.plus_one_relation : null)
        
        // Ensure plusOne is true if there's a name or relation
        const hasPlusOneName = plusOneNameRaw && 
                              String(plusOneNameRaw).trim() !== '' && 
                              String(plusOneNameRaw).trim() !== 'null' &&
                              String(plusOneNameRaw).trim().toLowerCase() !== 'none'
        const hasPlusOneRelation = plusOneRelationRaw && 
                                  String(plusOneRelationRaw).trim() !== '' && 
                                  String(plusOneRelationRaw).trim() !== 'null' &&
                                  String(plusOneRelationRaw).trim().toLowerCase() !== 'none'
        const plusOne = Boolean(plusOneRaw || hasPlusOneName || hasPlusOneRelation || false)
        
        // ALWAYS return the raw values - let frontend decide what to display
        // Only trim if they exist, but don't filter them out
        const mapped = {
          eventId: er.eventId,
          eventName: er.event?.name || 'Unknown Event',
          status: er.status,
          plusOne: plusOne,
          plusOneName: plusOneNameRaw != null && plusOneNameRaw !== '' ? String(plusOneNameRaw).trim() : null,
          plusOneRelation: plusOneRelationRaw != null && plusOneRelationRaw !== '' ? String(plusOneRelationRaw).trim() : null,
        }
        
        console.log(`[Submit API Response] Mapping event response for ${er.eventId}:`, {
          raw: { plusOneRaw, plusOneNameRaw, plusOneRelationRaw },
          mapped,
          hasPlusOneName,
          hasPlusOneRelation,
        })
        
        // CRITICAL: Always log to verify data is being returned
        console.log('[Submit] Mapping event response for return:', {
          raw: er,
          rawKeys: Object.keys(er),
          hasPlusOneField: 'plusOne' in er,
          hasPlusOneNameField: 'plusOneName' in er,
          hasPlusOneRelationField: 'plusOneRelation' in er,
          plusOneRaw,
          plusOneNameRaw,
          plusOneRelationRaw,
          hasPlusOneName,
          hasPlusOneRelation,
          finalPlusOne: plusOne,
          mapped: mapped,
          willReturnPlusOneName: mapped.plusOneName,
          willReturnPlusOneRelation: mapped.plusOneRelation,
        })
        
        return mapped
      }),
    })
  } catch (error: any) {
    console.error('Error submitting RSVP:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      meta: error?.meta,
      cause: error?.cause,
      name: error?.name,
    })
    
    const errorMessage = error?.message || String(error)
    const errorCode = error?.code
    
    // Check for specific Prisma errors
    if (errorCode === 'P2002') {
      return NextResponse.json(
        { 
          error: 'A record with this information already exists',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 400 }
      )
    }
    
    if (errorCode === 'P2003') {
      return NextResponse.json(
        { 
          error: 'Invalid reference - please check your event responses',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 400 }
      )
    }
    
    // Return detailed error - include more info to help debug
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: isDevelopment ? errorMessage : errorMessage.substring(0, 200), // Show first 200 chars even in production
        code: isDevelopment ? errorCode : undefined,
        // Include error code if it's a Prisma error
        prismaCode: errorCode?.startsWith('P') ? errorCode : undefined,
      },
      { status: 500 }
    )
  }
}

