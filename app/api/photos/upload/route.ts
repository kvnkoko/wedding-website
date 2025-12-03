import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { 
          error: 'File upload not configured. Please set up Vercel Blob Storage or use the URL method.',
          needsBlobSetup: true
        },
        { status: 500 }
      )
    }

    const { put } = await import('@vercel/blob')
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob Storage
    const blob = await put(`photos/${Date.now()}-${file.name}`, file, {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    
    // Provide more specific error messages
    if (error.message?.includes('BLOB_READ_WRITE_TOKEN')) {
      return NextResponse.json(
        { 
          error: 'File upload not configured. Please set up Vercel Blob Storage in your project settings.',
          needsBlobSetup: true
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to upload file. Please check your Vercel Blob Storage configuration.' },
      { status: 500 }
    )
  }
}

