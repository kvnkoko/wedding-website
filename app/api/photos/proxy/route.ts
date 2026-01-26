import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Validate that the URL is from Vercel Blob Storage
    if (!imageUrl.includes('blob.vercel-storage.com')) {
      return NextResponse.json(
        { error: 'Invalid image source' },
        { status: 400 }
      )
    }

    // Fetch the image from Vercel Blob Storage
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (compatible; WeddingWebsite/1.0)',
    }
    
    // Add authentication token if available (for private blobs, though we use public)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
    }
    
    const response = await fetch(imageUrl, { headers })

    if (!response.ok) {
      console.error(`Failed to fetch image: ${imageUrl}, Status: ${response.status}`)
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      )
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    console.error('Error proxying image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
