import type { Metadata } from 'next'
import './globals.css'
import Layout from '@/components/Layout'
import { elgraine, laBellaAurore, artica } from '@/lib/fonts'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Kevin & Tiffany Wedding',
  description: 'Join us in celebrating our special day',
  icons: {
    icon: [
      {
        url: '/favicon.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/favicon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${elgraine.variable} ${laBellaAurore.variable} ${artica.variable}`}>
      <body className="font-body antialiased">
        <Suspense fallback={
          <div className="min-h-screen bg-cream flex items-center justify-center">
            <p className="font-sans text-lg text-charcoal/70">Loading...</p>
          </div>
        }>
          <Layout>{children}</Layout>
        </Suspense>
      </body>
    </html>
  )
}

