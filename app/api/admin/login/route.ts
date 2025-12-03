import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set')
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Test database connection first
    try {
      const admin = await prisma.adminUser.findUnique({
        where: { email },
      })

      if (!admin) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const isValid = await verifyPassword(password, admin.passwordHash)

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Set session cookie (simplified - in production use proper session management)
      const cookieStore = await cookies()
      cookieStore.set('admin_session', admin.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return NextResponse.json({
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
        },
      })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      // Log more details for debugging
      console.error('Error code:', dbError?.code)
      console.error('Error message:', dbError?.message)
      console.error('DATABASE_URL exists:', !!process.env.DATABASE_URL)
      
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: process.env.NODE_ENV === 'development' ? dbError?.message : dbError?.code || 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error logging in:', error)
    // Return more detailed error in development, generic in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message || 'Unknown error'
      : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  return NextResponse.json({ success: true })
}

