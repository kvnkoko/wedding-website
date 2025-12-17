import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get ALL columns from rsvp_event_responses table
    const allColumns = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'rsvp_event_responses'
      ORDER BY ordinal_position
    `
    
    // Check specifically for plus one columns
    const plusOneColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'rsvp_event_responses' 
      AND column_name IN ('plusOne', 'plus_one', 'plusOneName', 'plus_one_name', 'plusOneRelation', 'plus_one_relation')
      ORDER BY column_name
    `
    
    // Get a sample of actual data
    const sampleData = await prisma.$queryRawUnsafe<Array<any>>(
      'SELECT * FROM rsvp_event_responses LIMIT 1'
    )
    
    // Get count of records with plus one data
    let plusOneCount = 0
    try {
      // Try camelCase first
      const camelCaseCount = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM rsvp_event_responses WHERE "plusOne" = true
      `
      plusOneCount = Number(camelCaseCount[0]?.count || 0)
    } catch {
      try {
        // Try snake_case
        const snakeCaseCount = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count FROM rsvp_event_responses WHERE plus_one = true
        `
        plusOneCount = Number(snakeCaseCount[0]?.count || 0)
      } catch {
        plusOneCount = -1 // Error
      }
    }
    
    return NextResponse.json({
      allColumns: allColumns,
      plusOneColumns: plusOneColumns,
      hasPlusOneColumns: plusOneColumns.length >= 3,
      plusOneColumnNames: plusOneColumns.map(c => c.column_name),
      sampleData: sampleData,
      plusOneCount: plusOneCount,
      message: 'Schema diagnostic complete'
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}

