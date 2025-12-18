/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      transitionDuration: {
        '600': '600ms',
      },
      fontFamily: {
        title: ['var(--font-elgraine)', 'Georgia', 'serif'],
        script: ['var(--font-script)', 'Brush Script MT', 'cursive'],
        body: ['var(--font-artica)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Light mode - refined neutrals that complement Tiffany blue
        cream: '#F8F9FA', // Cool, clean white with slight blue-gray undertone
        beige: '#F1F3F5', // Soft gray-beige for subtle backgrounds
        taupe: '#E9ECEF', // Light gray-taupe for borders and dividers
        sage: '#0ABAB5', // Tiffany Blue - classic Tiffany & Co. color
        charcoal: '#1A1D29', // Deep blue-gray for text (more sophisticated than pure black)
        mint: '#B8E6B8',
        tan: '#D2B48C',
        brown: '#8B4513',
        navy: '#1E293B', // Deep slate blue-gray
        pink: '#F4C2C2',
        mauve: '#E6B8D3',
        // Dark mode colors - sophisticated dark palette with blue undertones
        'dark-bg': '#0F1419', // Deep blue-black background (sophisticated, not pure black)
        'dark-surface': '#1A1F2E', // Slightly lighter surface with blue-gray undertone
        'dark-card': '#1E2535', // Card background with subtle blue tint
        'dark-text': '#F1F5F9', // Soft blue-white for primary text
        'dark-text-secondary': '#CBD5E1', // Cool gray for secondary text
        'dark-border': '#2D3748', // Refined border color with blue-gray tone
      },
    },
  },
  plugins: [],
}

