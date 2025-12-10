import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventResponses } = body

    // Test creating a simple event response
    const testData = Object.entries(eventResponses || {}).map(([eventId, response]) => {
      const responseData = typeof response === 'string' 
        ? response 
        : (response as any).status
      return {
        eventId,
        status: responseData,
      }
    })

    return NextResponse.json({
      success: true,
      parsedData: testData,
      originalData: eventResponses,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message,
      stack: error?.stack,
    }, { status: 500 })
  }
}

