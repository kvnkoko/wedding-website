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
        cream: '#FAF8F3',
        beige: '#F5F1E8',
        taupe: '#E8E3D8',
        sage: '#6B9B9A', // Muted earthy Tiffany blue - subtle cyan-teal with gray undertones
        charcoal: '#2C2C2C',
        mint: '#B8E6B8',
        tan: '#D2B48C',
        brown: '#8B4513',
        navy: '#2C3E50',
        pink: '#F4C2C2',
        mauve: '#E6B8D3',
        // Dark mode colors
        'dark-bg': '#1A1A1A',
        'dark-surface': '#242424',
        'dark-card': '#2A2A2A',
        'dark-text': '#E8E8E8',
        'dark-text-secondary': '#B8B8B8',
        'dark-border': '#3A3A3A',
      },
    },
  },
  plugins: [],
}

