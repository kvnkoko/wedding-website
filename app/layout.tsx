import type { Metadata } from 'next'
import './globals.css'
import Layout from '@/components/Layout'
import { elgraine, laBellaAurore, artica } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'Kevin & Tiffany Wedding',
  description: 'Join us in celebrating our special day',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${elgraine.variable} ${laBellaAurore.variable} ${artica.variable}`}>
      <body className="font-body antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}

