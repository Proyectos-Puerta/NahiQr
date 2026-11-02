/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1D1C1E',
          light: '#C8D1D9',
          yellow: '#EDC224',
          red: '#BD0102',
          orange: '#FF7D01',
          purple: '#9007EB',
          pink: '#EF0787',
        },
      },
      fontFamily: {
        mono: ['"VT323"', 'ui-monospace', 'monospace'],
        // Generic handwriting/marker slot: swap the first entry to change the footer font.
        marker: ['"Permanent Marker"', 'cursive'],
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        // Fill layer grows from the bottom (scaleY 0) to the top (scaleY 1), holds full, then restarts.
        'battery-fill': {
          '0%': { transform: 'scaleY(0)' },
          '85%': { transform: 'scaleY(1)' },
          '100%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 2.4s ease-in-out infinite',
        'battery-fill': 'battery-fill 3s ease-in-out infinite',
      },
      backgroundImage: {
        // Dark yellow/black mix at the very top (#3B3109 ≈ brand-yellow at 25% over black),
        // blending quickly into brand-dark for the rest of the screen.
        'teaser-fade':
          'linear-gradient(to bottom, #3B3109 0%, #262116 12%, #1D1C1E 30%, #1D1C1E 100%)',
      },
    },
  },
  plugins: [],
};
