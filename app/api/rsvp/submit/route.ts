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
        // Get raw values from response - don't filter them yet
        const rawPlusOneName = (response as any).plusOneName
        const rawPlusOneRelation = (response as any).plusOneRelation
        const plusOneValue = (response as any).plusOne
        
        // Convert to strings and trim, but keep them even if they're empty
        plusOneName = rawPlusOneName != null && rawPlusOneName !== '' ? String(rawPlusOneName).trim() : null
        plusOneRelation = rawPlusOneRelation != null && rawPlusOneRelation !== '' ? String(rawPlusOneRelation).trim() : null
        
        // Set plusOne to true if checkbox is checked OR if we have name/relation
        const plusOneBool = plusOneValue === true || plusOneValue === 'true' || plusOneValue === 'on' || plusOneValue === 1
        hasName = Boolean(plusOneName && plusOneName !== '')
        hasRelation = Boolean(plusOneRelation && plusOneRelation !== '')
        plusOne = plusOneBool || hasName || hasRelation || false
        
        console.log(`[Submit] Processing event ${eventId}:`, {
          status,
          plusOneValue,
          plusOneBool,
          rawPlusOneName,
          rawPlusOneRelation,
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
      
      // ALWAYS include Plus One data - send the values we received (trimmed)
      // Don't filter them out based on validation
      const finalPlusOneName = plusOneName  // Already trimmed above
      const finalPlusOneRelation = plusOneRelation  // Already trimmed above
      
      // Set plusOne to true if we have name or relation, even if flag wasn't set
      const finalPlusOne = Boolean(plusOne || finalPlusOneName || finalPlusOneRelation)
      
      return {
        eventId,
        status: status,
        plusOne: finalPlusOne,
        plusOneName: finalPlusOneName,  // Send the value, even if it might be empty
        plusOneRelation: finalPlusOneRelation,  // Send the value, even if it might be empty
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

      // Since we've updated Prisma schema with @map directives, always use Prisma
      // Prisma will automatically handle the column name mapping
      const hasNewSchema = true
      console.log('Using Prisma with @map directives - schema mapping handled automatically')

      // CRITICAL: Ensure ALL required columns exist before creating event responses
      // Check what columns actually exist and create missing ones
      try {
        // First, check if table exists
        const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'rsvp_event_responses'
          ) as exists
        `
        
        if (!tableExists[0]?.exists) {
          console.error('❌ Table rsvp_event_responses does not exist!')
          throw new Error('Table rsvp_event_responses does not exist. Please run Prisma migrations.')
        }
        
        // Get ALL columns in the table
        const allColumns = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
          SELECT column_name, data_type
          FROM information_schema.columns 
          WHERE table_schema = 'public'
          AND table_name = 'rsvp_event_responses'
          ORDER BY ordinal_position
        `
        
        console.log('📋 Current table columns:', allColumns.map(c => `${c.column_name} (${c.data_type})`).join(', '))
        
        const existingColumnNames = allColumns.map(c => c.column_name.toLowerCase())
        
        // Define ALL required columns with their definitions
        const requiredColumns: Array<{ name: string; definition: string; optional?: boolean }> = [
          { name: 'id', definition: 'TEXT PRIMARY KEY', optional: false },
          { name: 'rsvp_id', definition: 'TEXT NOT NULL', optional: false },
          { name: 'event_id', definition: 'TEXT NOT NULL', optional: false },
          { name: 'status', definition: 'TEXT NOT NULL', optional: false },
          { name: 'created_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP', optional: false },
          { name: 'plus_one', definition: 'BOOLEAN DEFAULT false', optional: true },
          { name: 'plus_one_name', definition: 'TEXT', optional: true },
          { name: 'plus_one_relation', definition: 'TEXT', optional: true },
          { name: 'updated_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP', optional: true },
        ]
        
        const missingColumns: string[] = []
        
        for (const col of requiredColumns) {
          const exists = existingColumnNames.includes(col.name.toLowerCase())
          if (!exists) {
            if (col.optional) {
              missingColumns.push(`${col.name} ${col.definition}`)
              console.log(`⚠️ Missing optional column: ${col.name}`)
            } else {
              console.error(`❌ CRITICAL: Missing required column: ${col.name}`)
              missingColumns.push(`${col.name} ${col.definition}`)
            }
          } else {
            console.log(`✅ Column exists: ${col.name}`)
          }
        }
        
        if (missingColumns.length > 0) {
          console.log('🔧 Adding missing columns:', missingColumns)
          for (const columnDef of missingColumns) {
            const columnName = columnDef.split(' ')[0]
            try {
              // Use IF NOT EXISTS to avoid errors if column was added concurrently
              await prisma.$executeRawUnsafe(
                `ALTER TABLE rsvp_event_responses ADD COLUMN IF NOT EXISTS ${columnDef}`
              )
              console.log(`✅ Successfully added column: ${columnName}`)
            } catch (addError: any) {
              // If column already exists (race condition), that's fine
              if (addError.message?.includes('already exists') || addError.code === '42701') {
                console.log(`ℹ️ Column ${columnName} already exists (race condition)`)
              } else {
                console.error(`❌ Failed to add column ${columnName}:`, addError.message)
                throw addError // Re-throw if it's a real error
              }
            }
          }
          console.log('✅ All missing columns have been added')
        } else {
          console.log('✅ All required columns exist')
        }
      } catch (columnCheckError: any) {
        console.error('❌ CRITICAL: Column check/creation failed:', columnCheckError.message)
        console.error('Stack:', columnCheckError.stack)
        // Don't continue if we can't ensure columns exist - this will cause the createMany to fail anyway
        throw new Error(`Database schema issue: ${columnCheckError.message}. Please ensure the rsvp_event_responses table has all required columns.`)
      }

      // Create RSVP and event responses in a transaction
      rsvp = await prisma.$transaction(async (tx) => {
        // First create the RSVP
        console.log('🔵 Creating RSVP with data:', {
          inviteLinkConfigId,
          name,
          phone,
          email,
          side,
          hasAnyPlusOne,
          editToken: editToken ? '***' : null,
        })
        
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
        
        console.log('✅ RSVP created successfully:', {
          id: newRsvp.id,
          name: newRsvp.name,
          hasId: !!newRsvp.id,
          idType: typeof newRsvp.id,
          idLength: newRsvp.id?.length,
        })
        
        // CRITICAL: Verify newRsvp.id exists before proceeding
        if (!newRsvp.id) {
          console.error('❌ CRITICAL ERROR: newRsvp.id is null or undefined!', {
            newRsvp: JSON.stringify(newRsvp, null, 2),
          })
          throw new Error('Failed to create RSVP: ID was not generated')
        }

        // Create event responses - use the schema we detected
        if (hasNewSchema) {
          // New schema - include plus one fields using Prisma
          console.log(`🔵 Preparing ${eventResponsesData.length} event responses with rsvpId: ${newRsvp.id}`)
          
          const eventResponseData = eventResponsesData.map((responseData) => {
            // Get raw values - don't filter them out
            const rawPlusOneName = responseData.plusOneName
            const rawPlusOneRelation = responseData.plusOneRelation
            
            // Trim values if they exist, but save them even if they're empty
            const plusOneName = rawPlusOneName != null && rawPlusOneName !== '' 
              ? String(rawPlusOneName).trim() 
              : null
            const plusOneRelation = rawPlusOneRelation != null && rawPlusOneRelation !== ''
              ? String(rawPlusOneRelation).trim()
              : null
            
            // Set plusOne to true if we have name/relation OR if the flag is set
            const hasName = plusOneName != null && plusOneName !== ''
            const hasRelation = plusOneRelation != null && plusOneRelation !== ''
            const plusOne = Boolean(responseData.plusOne || hasName || hasRelation || false)
            
            // CRITICAL: Verify rsvpId is not null/undefined/empty before using it
            if (!newRsvp.id || typeof newRsvp.id !== 'string' || newRsvp.id.trim() === '') {
              console.error(`❌ CRITICAL: newRsvp.id is invalid for event ${responseData.eventId}:`, {
                rsvpId: newRsvp.id,
                rsvpIdType: typeof newRsvp.id,
                newRsvp: JSON.stringify(newRsvp, null, 2),
              })
              throw new Error(`Cannot create event response: rsvpId is invalid (${newRsvp.id}) for event ${responseData.eventId}`)
            }
            
            // Don't include updatedAt - Prisma will handle it automatically with @updatedAt
            // Only include fields that we're explicitly setting
            // Use camelCase field names - Prisma will map to snake_case via @map directives
            const data: any = {
              rsvpId: String(newRsvp.id).trim(),  // Explicitly convert to string and trim
              eventId: String(responseData.eventId).trim(),  // Ensure eventId is also a string
              status: String(responseData.status).trim(),  // Ensure status is a string
              plusOne: Boolean(plusOne),
              plusOneName: plusOneName,  // Save the value, even if it's empty
              plusOneRelation: plusOneRelation,  // Save the value, even if it's empty
            }
            
            // CRITICAL: Verify all required fields are present and valid
            if (!data.rsvpId || data.rsvpId === '' || !data.eventId || data.eventId === '' || !data.status || data.status === '') {
              console.error('❌ Missing or invalid required fields in event response data:', {
                rsvpId: data.rsvpId,
                eventId: data.eventId,
                status: data.status,
                rsvpIdValid: !!data.rsvpId && data.rsvpId !== '',
                eventIdValid: !!data.eventId && data.eventId !== '',
                statusValid: !!data.status && data.status !== '',
                fullData: data,
                newRsvpId: newRsvp.id,
              })
              throw new Error(`Missing or invalid required fields for event response: rsvpId="${data.rsvpId}", eventId="${data.eventId}", status="${data.status}"`)
            }
            
            // Only add createdAt if the column exists, otherwise let Prisma handle it
            // Don't include updatedAt - @updatedAt directive handles it
            
            console.log(`[Submit] Creating event response for event ${responseData.eventId}:`, {
              original: responseData,
              rawPlusOneName,
              rawPlusOneRelation,
              plusOneName,
              plusOneRelation,
              hasName,
              hasRelation,
              processed: data,
              willSavePlusOne: data.plusOne,
              willSavePlusOneName: data.plusOneName,
              willSavePlusOneRelation: data.plusOneRelation,
            })
            
            // CRITICAL: Verify the data we're about to save
            if (data.plusOneName || data.plusOneRelation) {
              console.log(`[Submit] ✅ VERIFYING: About to save Plus One data for event ${responseData.eventId}:`, {
                plusOne: data.plusOne,
                plusOneName: data.plusOneName,
                plusOneRelation: data.plusOneRelation,
                dataObject: JSON.stringify(data, null, 2),
              })
            } else {
              console.warn(`[Submit] ⚠️ WARNING: No Plus One data to save for event ${responseData.eventId}`, {
                originalResponseData: responseData,
                processedData: data,
              })
            }
            
            return data
          })
          
          console.log('🔵 Creating event responses with plus one data:', {
            count: eventResponseData.length,
            rsvpId: newRsvp.id,
            sample: eventResponseData[0],
            allWithPlusOne: eventResponseData.filter(r => r.plusOne || r.plusOneName),
            allData: eventResponseData.map(r => ({
              rsvpId: r.rsvpId,
              eventId: r.eventId,
              status: r.status,
              plusOne: r.plusOne,
              plusOneName: r.plusOneName,
              plusOneRelation: r.plusOneRelation,
            })),
          })
          
          // CRITICAL: Verify all event responses have valid rsvpId, eventId, and status
          const invalidResponses = eventResponseData.filter(r => {
            const hasRsvpId = r.rsvpId && typeof r.rsvpId === 'string' && r.rsvpId.trim() !== ''
            const hasEventId = r.eventId && typeof r.eventId === 'string' && r.eventId.trim() !== ''
            const hasStatus = r.status && typeof r.status === 'string' && r.status.trim() !== ''
            return !hasRsvpId || !hasEventId || !hasStatus
          })
          
          if (invalidResponses.length > 0) {
            console.error('❌ Invalid event responses found:', {
              invalidCount: invalidResponses.length,
              invalidResponses: invalidResponses.map(r => ({
                rsvpId: r.rsvpId,
                rsvpIdType: typeof r.rsvpId,
                rsvpIdValid: r.rsvpId && typeof r.rsvpId === 'string' && r.rsvpId.trim() !== '',
                eventId: r.eventId,
                eventIdValid: r.eventId && typeof r.eventId === 'string' && r.eventId.trim() !== '',
                status: r.status,
                statusValid: r.status && typeof r.status === 'string' && r.status.trim() !== '',
              })),
              expectedRsvpId: newRsvp.id,
              allResponses: eventResponseData,
            })
            throw new Error(`Invalid event responses: ${invalidResponses.length} responses missing or invalid required fields (rsvpId, eventId, or status)`)
          }
          
          // Double-check rsvpId is set for all responses and matches newRsvp.id
          const allRsvpIdsMatch = eventResponseData.every(r => {
            const matches = r.rsvpId === newRsvp.id && r.rsvpId != null && r.rsvpId !== ''
            if (!matches) {
              console.error('❌ rsvpId mismatch:', {
                responseRsvpId: r.rsvpId,
                expectedRsvpId: newRsvp.id,
                match: r.rsvpId === newRsvp.id,
              })
            }
            return matches
          })
          
          console.log('🔵 Final verification before createMany:', {
            rsvpId: newRsvp.id,
            rsvpIdType: typeof newRsvp.id,
            rsvpIdLength: newRsvp.id?.length,
            responseCount: eventResponseData.length,
            allRsvpIds: eventResponseData.map(r => ({ rsvpId: r.rsvpId, type: typeof r.rsvpId, length: r.rsvpId?.length })),
            allRsvpIdsMatch: allRsvpIdsMatch,
            allValid: eventResponseData.every(r => 
              r.rsvpId && typeof r.rsvpId === 'string' && r.rsvpId.trim() !== '' &&
              r.eventId && typeof r.eventId === 'string' && r.eventId.trim() !== '' &&
              r.status && typeof r.status === 'string' && r.status.trim() !== ''
            ),
            sampleData: eventResponseData[0],
          })
          
          if (!allRsvpIdsMatch) {
            throw new Error(`rsvpId mismatch: Not all responses have the correct rsvpId. Expected: ${newRsvp.id}`)
          }
          
          // CRITICAL: Verify the rsvp_id column exists in the database
          try {
            const columnCheck = await tx.$queryRaw<Array<{ column_name: string }>>`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public'
              AND table_name = 'rsvp_event_responses'
              AND column_name = 'rsvp_id'
            `
            
            if (columnCheck.length === 0) {
              console.error('❌ CRITICAL: rsvp_id column does not exist in rsvp_event_responses table!')
              throw new Error('Database column rsvp_id does not exist. Please run migrations.')
            }
            
            console.log('✅ Verified rsvp_id column exists')
          } catch (colCheckError: any) {
            console.error('❌ Failed to verify rsvp_id column:', colCheckError.message)
            throw new Error(`Database schema verification failed: ${colCheckError.message}`)
          }
          
          try {
            console.log('🔵 About to call createMany with', eventResponseData.length, 'responses')
            console.log('🔵 First response data:', JSON.stringify(eventResponseData[0], null, 2))
            console.log('🔵 All response data:', JSON.stringify(eventResponseData, null, 2))
            
            // CRITICAL: Try createMany first, but if it fails due to mapping issues, use individual creates
            // Prisma should handle @map automatically, but sometimes createMany has issues with mapped fields
            try {
              const result = await tx.rsvpEventResponse.createMany({
                data: eventResponseData,
              })
              console.log('✅ createMany result:', result)
            } catch (createManyError: any) {
              // If createMany fails with null constraint on rsvpId, try individual creates
              // This can happen if Prisma's @map directive isn't working correctly with createMany
              if (createManyError.code === 'P2011' && createManyError.meta?.constraint?.includes('rsvpId')) {
                console.warn('⚠️ createMany failed with rsvpId null constraint, trying individual creates...')
                console.warn('⚠️ This suggests Prisma @map directive may not be working with createMany')
                
                // Use individual create calls - Prisma handles @map better with create
                const createdResponses = []
                for (const responseData of eventResponseData) {
                  console.log('🔵 Creating individual response:', {
                    rsvpId: responseData.rsvpId,
                    eventId: responseData.eventId,
                    status: responseData.status,
                    plusOne: responseData.plusOne,
                    plusOneName: responseData.plusOneName,
                    plusOneRelation: responseData.plusOneRelation,
                  })
                  
                  const created = await tx.rsvpEventResponse.create({
                    data: {
                      rsvpId: responseData.rsvpId,
                      eventId: responseData.eventId,
                      status: responseData.status,
                      plusOne: responseData.plusOne,
                      plusOneName: responseData.plusOneName,
                      plusOneRelation: responseData.plusOneRelation,
                    },
                  })
                  createdResponses.push(created)
                  console.log('✅ Created response:', created.id)
                }
                console.log('✅ Successfully created', createdResponses.length, 'responses individually')
              } else {
                // Re-throw if it's a different error
                console.error('❌ createMany failed with different error:', createManyError)
                throw createManyError
              }
            }
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
          
          // CRITICAL: Immediately verify what was actually saved using raw query to see actual DB values
          const verifySavedRaw = await tx.$queryRawUnsafe<Array<any>>(
            `SELECT event_id, status, plus_one, plus_one_name, plus_one_relation
             FROM rsvp_event_responses 
             WHERE rsvp_id = $1`,
            newRsvp.id
          )
          console.log('✅ IMMEDIATELY AFTER SAVE - Raw database values:', JSON.stringify(verifySavedRaw, null, 2))
          
          // Also verify with Prisma
          const verifySaved = await tx.rsvpEventResponse.findMany({
            where: { rsvpId: newRsvp.id },
            select: {
              eventId: true,
              status: true,
              plusOne: true,
              plusOneName: true,
              plusOneRelation: true,
            },
          })
          console.log('✅ IMMEDIATELY AFTER SAVE - Prisma query result:', JSON.stringify(verifySaved, null, 2))
          
          // Compare raw vs Prisma
          if (verifySavedRaw.length > 0 && verifySaved.length > 0) {
            const raw = verifySavedRaw[0]
            const prisma = verifySaved[0]
            console.log('🔍 COMPARISON - Raw DB vs Prisma:', {
              raw: {
                plus_one: raw.plus_one,
                plus_one_name: raw.plus_one_name,
                plus_one_relation: raw.plus_one_relation,
              },
              prisma: {
                plusOne: prisma.plusOne,
                plusOneName: prisma.plusOneName,
                plusOneRelation: prisma.plusOneRelation,
              },
              match: {
                plusOne: raw.plus_one === prisma.plusOne,
                plusOneName: raw.plus_one_name === prisma.plusOneName,
                plusOneRelation: raw.plus_one_relation === prisma.plusOneRelation,
              },
            })
          }
          
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
        }

        // Fetch the complete RSVP with relations
        // Prisma handles column mapping automatically with @map directives
          const fetched = await tx.rsvp.findUnique({
            where: { id: newRsvp.id },
            include: {
              eventResponses: {
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
          
          // CRITICAL: Log what Prisma actually returned
          console.log('[Submit] Prisma fetch result:', {
            hasEventResponses: !!fetched?.eventResponses,
            eventResponsesCount: fetched?.eventResponses?.length || 0,
            firstEventResponse: fetched?.eventResponses?.[0] ? {
              eventId: fetched.eventResponses[0].eventId,
              status: fetched.eventResponses[0].status,
              plusOne: fetched.eventResponses[0].plusOne,
              plusOneName: fetched.eventResponses[0].plusOneName,
              plusOneRelation: fetched.eventResponses[0].plusOneRelation,
              allKeys: Object.keys(fetched.eventResponses[0]),
              fullObject: JSON.stringify(fetched.eventResponses[0], null, 2),
            } : null,
            allEventResponses: JSON.stringify(fetched?.eventResponses || [], null, 2),
          })
          
          return fetched
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

    // CRITICAL: Log what we're about to return to see if data is there
    console.log('[Submit API] About to return RSVP response:', {
      rsvpId: rsvp.id,
      eventResponsesCount: rsvp.eventResponses?.length || 0,
      eventResponsesRaw: JSON.stringify(rsvp.eventResponses, null, 2),
      firstEventResponse: rsvp.eventResponses?.[0] ? {
        eventId: rsvp.eventResponses[0].eventId,
        status: rsvp.eventResponses[0].status,
        plusOne: rsvp.eventResponses[0].plusOne,
        plusOneName: rsvp.eventResponses[0].plusOneName,
        plusOneRelation: rsvp.eventResponses[0].plusOneRelation,
        allKeys: Object.keys(rsvp.eventResponses[0]),
        fullObject: JSON.stringify(rsvp.eventResponses[0], null, 2),
      } : null,
    })
    
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
        // CRITICAL: Log what we're receiving from Prisma
        console.log(`[Submit API Response] Mapping event response ${er.eventId}:`, {
          rawEr: JSON.stringify(er, null, 2),
          allKeys: Object.keys(er),
          plusOne: er.plusOne,
          plusOneName: er.plusOneName,
          plusOneRelation: er.plusOneRelation,
          plusOneType: typeof er.plusOne,
          plusOneNameType: typeof er.plusOneName,
          plusOneRelationType: typeof er.plusOneRelation,
        })
        
        // Handle both camelCase and snake_case field names
        // Also check for null/undefined explicitly - be very thorough
        const plusOneRaw = er.plusOne !== undefined && er.plusOne !== null ? er.plusOne : 
                          (er.plus_one !== undefined && er.plus_one !== null ? er.plus_one : false)
        const plusOneNameRaw = er.plusOneName !== undefined && er.plusOneName !== null ? er.plusOneName : 
                              (er.plus_one_name !== undefined && er.plus_one_name !== null ? er.plus_one_name : null)
        const plusOneRelationRaw = er.plusOneRelation !== undefined && er.plusOneRelation !== null ? er.plusOneRelation : 
                                  (er.plus_one_relation !== undefined && er.plus_one_relation !== null ? er.plus_one_relation : null)
        
        // CRITICAL: Don't validate - just return what we have
        // Trim if they exist, but don't filter them out based on content
        const plusOneName = plusOneNameRaw != null && plusOneNameRaw !== '' 
          ? String(plusOneNameRaw).trim() 
          : null
        const plusOneRelation = plusOneRelationRaw != null && plusOneRelationRaw !== ''
          ? String(plusOneRelationRaw).trim()
          : null
        
        // Set plusOne to true if we have name/relation OR if the flag is true
        const plusOne = Boolean(plusOneRaw || (plusOneName != null && plusOneName !== '') || (plusOneRelation != null && plusOneRelation !== ''))
        
        const mapped = {
          eventId: er.eventId,
          eventName: er.event?.name || 'Unknown Event',
          status: er.status,
          plusOne: plusOne,
          plusOneName: plusOneName,  // Return the value, even if it's null
          plusOneRelation: plusOneRelation,  // Return the value, even if it's null
        }
        
        console.log(`[Submit API Response] Mapped event response ${er.eventId}:`, {
          mapped,
          plusOneRaw,
          plusOneNameRaw,
          plusOneRelationRaw,
          finalPlusOneName: mapped.plusOneName,
          finalPlusOneRelation: mapped.plusOneRelation,
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

