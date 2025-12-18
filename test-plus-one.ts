/**
 * Test script to verify Plus One functionality
 * Run with: npx tsx test-plus-one.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPlusOne() {
  console.log('🧪 Testing Plus One Functionality...\n')

  try {
    // 1. Check if Plus One columns exist in database
    console.log('1️⃣ Checking database schema...')
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'rsvp_event_responses'
      AND column_name IN ('plusOne', 'plus_one', 'plusOneName', 'plus_one_name', 'plusOneRelation', 'plus_one_relation')
      ORDER BY column_name
    `
    
    console.log('Found columns:', columns.map(c => c.column_name))
    
    const hasPlusOne = columns.some(c => c.column_name === 'plusOne' || c.column_name === 'plus_one')
    const hasPlusOneName = columns.some(c => c.column_name === 'plusOneName' || c.column_name === 'plus_one_name')
    const hasPlusOneRelation = columns.some(c => c.column_name === 'plusOneRelation' || c.column_name === 'plus_one_relation')
    
    if (!hasPlusOne || !hasPlusOneName || !hasPlusOneRelation) {
      console.error('❌ ERROR: Plus One columns are missing from database!')
      console.error('Missing columns:', {
        plusOne: !hasPlusOne,
        plusOneName: !hasPlusOneName,
        plusOneRelation: !hasPlusOneRelation,
      })
      console.error('\n🔧 SOLUTION: Run database migration:')
      console.error('   npx prisma db push')
      return
    }
    
    console.log('✅ All Plus One columns exist\n')

    // 2. Test creating an RSVP with Plus One data
    console.log('2️⃣ Testing RSVP creation with Plus One data...')
    
    // Find an existing event and invite config
    const event = await prisma.event.findFirst()
    const config = await prisma.inviteLinkConfig.findFirst()
    
    if (!event || !config) {
      console.error('❌ ERROR: No events or invite configs found. Run seed first.')
      return
    }
    
    console.log(`Using event: ${event.name} (${event.id})`)
    console.log(`Using config: ${config.label} (${config.id})`)
    
    // Create test RSVP with Plus One
    const testRsvp = await prisma.rsvp.create({
      data: {
        inviteLinkConfigId: config.id,
        name: 'Test User',
        phone: '1234567890',
        email: 'test@example.com',
        side: 'Both',
        editToken: `test-${Date.now()}`,
        eventResponses: {
          create: {
            eventId: event.id,
            status: 'YES',
            plusOne: true,
            plusOneName: 'Test Plus One',
            plusOneRelation: 'Spouse',
          },
        },
      },
      include: {
        eventResponses: true,
      },
    })
    
    console.log('✅ Created test RSVP:', {
      id: testRsvp.id,
      eventResponses: testRsvp.eventResponses.map(er => ({
        eventId: er.eventId,
        status: er.status,
        plusOne: er.plusOne,
        plusOneName: er.plusOneName,
        plusOneRelation: er.plusOneRelation,
      })),
    })
    
    // 3. Test retrieving the RSVP
    console.log('\n3️⃣ Testing RSVP retrieval...')
    const retrievedRsvp = await prisma.rsvp.findUnique({
      where: { id: testRsvp.id },
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
    
    if (!retrievedRsvp) {
      console.error('❌ ERROR: Could not retrieve RSVP')
      return
    }
    
    const eventResponse = retrievedRsvp.eventResponses[0]
    console.log('Retrieved event response:', {
      eventId: eventResponse.eventId,
      status: eventResponse.status,
      plusOne: eventResponse.plusOne,
      plusOneName: eventResponse.plusOneName,
      plusOneRelation: eventResponse.plusOneRelation,
    })
    
    // 4. Verify the data
    console.log('\n4️⃣ Verifying Plus One data...')
    if (eventResponse.plusOneName === 'Test Plus One' && eventResponse.plusOneRelation === 'Spouse') {
      console.log('✅ SUCCESS: Plus One data is saved and retrieved correctly!')
    } else {
      console.error('❌ ERROR: Plus One data mismatch!')
      console.error('Expected:', { name: 'Test Plus One', relation: 'Spouse' })
      console.error('Got:', { 
        name: eventResponse.plusOneName, 
        relation: eventResponse.plusOneRelation 
      })
    }
    
    // 5. Clean up
    console.log('\n5️⃣ Cleaning up test data...')
    await prisma.rsvp.delete({
      where: { id: testRsvp.id },
    })
    console.log('✅ Test RSVP deleted')
    
  } catch (error: any) {
    console.error('❌ ERROR:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testPlusOne()

