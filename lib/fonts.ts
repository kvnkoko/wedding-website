import localFont from 'next/font/local'

// Elgraine - for titles/headings
export const elgraine = localFont({
  src: [
    {
      path: '../public/fonts/Elgraine-Medium.otf',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-elgraine',
  fallback: ['Georgia', 'serif'],
  display: 'swap',
})

// La Bella Aurore - for calligraphy/script
export const laBellaAurore = localFont({
  src: [
    {
      path: '../public/fonts/LaBelleAurore-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-script',
  fallback: ['Brush Script MT', 'cursive'],
  display: 'swap',
})

// Artica - for body text
export const artica = localFont({
  src: [
    {
      path: '../public/fonts/Artica-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-artica',
  fallback: ['system-ui', 'sans-serif'],
  display: 'swap',
})

