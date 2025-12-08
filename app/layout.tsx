import type { Metadata } from 'next'
import './globals.css'
import Layout from '@/components/Layout'
import DarkModeScript from '@/components/DarkModeScript'
import FirstVisitIndicator from '@/components/FirstVisitIndicator'
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
    <html lang="en" className={`${elgraine.variable} ${laBellaAurore.variable} ${artica.variable}`} suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html { background-color: #FAF8F3 !important; }
              html.dark { background-color: #1A1A1A !important; }
              body { background-color: #FAF8F3 !important; }
              html.dark body { background-color: #1A1A1A !important; }
              body > div { background-color: #FAF8F3 !important; }
              html.dark body > div { background-color: #1A1A1A !important; }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('darkMode');
                  // Default to light mode on first visit
                  var shouldBeDark = stored !== null ? stored === 'true' : false;
                  if (stored === null) {
                    localStorage.setItem('darkMode', 'false');
                  }
                  var bgColor = shouldBeDark ? '#1A1A1A' : '#FAF8F3';
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  document.documentElement.style.setProperty('background-color', bgColor, 'important');
                  if (document.body) {
                    document.body.style.setProperty('background-color', bgColor, 'important');
                  }
                  var setMainBg = function() {
                    var mainDiv = document.querySelector('body > div');
                    if (mainDiv) {
                      mainDiv.style.setProperty('background-color', bgColor, 'important');
                    }
                  };
                  setMainBg();
                  document.addEventListener('DOMContentLoaded', setMainBg);
                  document.documentElement.classList.add('dark-mode-initialized');
                } catch (e) {
                  document.documentElement.style.setProperty('background-color', '#FAF8F3', 'important');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased" style={{ backgroundColor: '#FAF8F3' }}>
        <DarkModeScript />
        <Suspense fallback={
          <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center">
            <p className="font-sans text-lg text-charcoal/70 dark:text-dark-text-secondary">Loading...</p>
          </div>
        }>
          <Layout>{children}</Layout>
          <FirstVisitIndicator />
        </Suspense>
      </body>
    </html>
  )
}

