import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'DATABASE_URL not set',
        hasUrl: false,
      }, { status: 500 })
    }

    // Test basic connection
    try {
      await prisma.$queryRaw`SELECT 1`
      
      // Test if tables exist
      const adminCount = await prisma.adminUser.count()
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        hasUrl: true,
        urlPrefix: process.env.DATABASE_URL.substring(0, 30) + '...',
        adminUserCount: adminCount,
      })
    } catch (dbError: any) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        hasUrl: true,
        urlPrefix: process.env.DATABASE_URL.substring(0, 30) + '...',
        errorCode: dbError?.code,
        errorMessage: dbError?.message,
        errorName: dbError?.name,
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Unknown error',
      errorMessage: error?.message,
    }, { status: 500 })
  }
}



