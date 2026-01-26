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

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Decode the URL - handle both encoded and unencoded
    try {
      // Try decoding, but if it fails or doesn't change, use original
      const decoded = decodeURIComponent(imageUrl)
      if (decoded !== imageUrl) {
        imageUrl = decoded
      }
    } catch {
      // If decoding fails, URL might already be decoded, use as-is
    }

    // Validate that the URL is from Vercel Blob Storage
    if (!imageUrl || !imageUrl.includes('blob.vercel-storage.com')) {
      console.error('Invalid image source URL:', imageUrl?.substring(0, 100))
      return NextResponse.json(
        { error: 'Invalid image source' },
        { status: 400 }
      )
    }

    console.log('Proxying image:', imageUrl.substring(0, 100) + '...')

    // Try fetching the image with proper headers
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      console.error('Request timeout for:', imageUrl.substring(0, 100))
    }, 15000) // 15 second timeout

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
        // @ts-ignore - cache option
        cache: 'no-store',
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const statusText = response.statusText
        console.error(`Failed to fetch image: ${imageUrl.substring(0, 100)}... Status: ${response.status} ${statusText}`)
        
        // If it's a 403/404, try without proxy (redirect)
        if (response.status === 403 || response.status === 404) {
          console.log('Attempting redirect for 403/404 response')
          return NextResponse.redirect(imageUrl, 302)
        }
        
        return NextResponse.json(
          { 
            error: `Failed to fetch image: ${response.status} ${statusText}`,
            url: imageUrl.substring(0, 100)
          },
          { status: response.status }
        )
      }

      // Get the image data
      const imageBuffer = await response.arrayBuffer()
      const contentType = response.headers.get('content-type') || 'image/jpeg'
      const contentLength = response.headers.get('content-length')

      console.log(`Successfully proxied image: ${contentLength} bytes, type: ${contentType}`)

      // Return the image with appropriate headers
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': contentLength || imageBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'X-Content-Type-Options': 'nosniff',
          'X-Proxy-Time': `${Date.now() - startTime}ms`,
        },
      })
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
