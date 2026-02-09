import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    let imageUrl = searchParams.get('url')
    const width = searchParams.get('w') ? parseInt(searchParams.get('w')!, 10) : 1200
    const quality = searchParams.get('q') ? Math.min(100, Math.max(1, parseInt(searchParams.get('q')!, 10))) : 85

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Decode the URL
    try {
      const decoded = decodeURIComponent(imageUrl)
      if (decoded !== imageUrl) imageUrl = decoded
    } catch {
      // Use as-is if decoding fails
    }

    // Validate that the URL is from Vercel Blob Storage
    if (!imageUrl || !imageUrl.includes('blob.vercel-storage.com')) {
      return NextResponse.json(
        { error: 'Invalid image source' },
        { status: 400 }
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const response = await fetch(imageUrl, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'image/*,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; WeddingWebsite/1.0)',
          'Referer': request.headers.get('referer') || '',
        },
        redirect: 'follow',
        cache: 'no-store' as RequestCache,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
          return NextResponse.redirect(imageUrl, 302)
        }
        return NextResponse.json(
          { error: `Failed to fetch image: ${response.status}` },
          { status: response.status }
        )
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer())
      const contentType = response.headers.get('content-type') || 'image/jpeg'

      // Optimize with Sharp: resize and compress for faster loading
      try {
        const sharp = (await import('sharp')).default
        const maxWidth = Math.min(width, 1920)
        const optimized = await sharp(imageBuffer)
          .resize(maxWidth, null, { withoutEnlargement: true })
          .webp({ quality })
          .toBuffer()

        return new NextResponse(new Uint8Array(optimized), {
          status: 200,
          headers: {
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Content-Type-Options': 'nosniff',
          },
        })
      } catch (sharpError) {
        // Fallback: return original if sharp fails
        return new NextResponse(new Uint8Array(imageBuffer), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Content-Type-Options': 'nosniff',
          },
        })
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        console.error('Request aborted (timeout) for:', imageUrl.substring(0, 100))
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        )
      }
      
      console.error('Fetch error:', fetchError.message)
      console.error('Error details:', {
        name: fetchError.name,
        cause: fetchError.cause,
        url: imageUrl.substring(0, 100),
      })
      
      // Last resort: try redirect
      return NextResponse.redirect(imageUrl, 302)
    }
  } catch (error: any) {
    console.error('Error in proxy route:', error)
    console.error('Error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.substring(0, 500),
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
