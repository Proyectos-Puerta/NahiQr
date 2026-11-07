/** @type {import('tailwindcss').Config} */

// Fine film grain (feTurbulence) used for the "semitono/trippy" texture from the brand manual.
const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // MUESTRA 26 identity manual (p.7). Rules: one dominant colour per piece (80/20) or
      // 60-30-10 (violet / yellow / one hot accent). Never place pink-violet, pink-red,
      // violet-red or orange-red side by side: separate them with black or white.
      colors: {
        brand: {
          black: '#000000',
          dark: '#1D1C1E',
          violet: '#9207EA',
          yellow: '#EEC324',
          pink: '#EE0787',
          orange: '#FE7C00',
          red: '#BC0103',
          white: '#FFFFFF',
        },
        // Non-brand "realistic detail" materials (duct tape, screws) and the RGB-split fringe.
        tape: { light: '#D4D7DB', DEFAULT: '#A9ADB2', dark: '#73777C' },
        fx: { cyan: '#00F0FF' },
      },
      fontFamily: {
        // Stand-in for TDTD (condensed grotesk headlines).
        display: ['Oswald', '"Arial Narrow"', 'sans-serif'],
        // Stand-in for "Computer Says No" (thin terminal monospace).
        mono: ['"Share Tech Mono"', 'ui-monospace', 'monospace'],
        // Chunky CRT digits for the live counter.
        pixel: ['VT323', 'ui-monospace', 'monospace'],
        // Brush logo "PUERTA 18".
        marker: ['"Permanent Marker"', 'cursive'],
      },
      backgroundImage: {
        grain: GRAIN_SVG,
        scanlines:
          'repeating-linear-gradient(to bottom, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 3px)',
        vignette: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.8) 100%)',
        'top-glow': 'radial-gradient(120% 55% at 50% -8%, rgba(146,7,234,0.55) 0%, rgba(146,7,234,0) 62%)',
        hazard: 'repeating-linear-gradient(-45deg, #EEC324 0 7px, #000000 7px 14px)',
        'hazard-lg': 'repeating-linear-gradient(-45deg, #EEC324 0 12px, #000000 12px 24px)',
        // Brushed steel for the barrier end caps.
        steel: 'linear-gradient(180deg, #E4E6E9 0%, #9DA1A6 45%, #5E6267 100%)',
        // Silver duct tape: sheen on top, woven fibres, metallic base.
        tape:
          'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.15) 100%), repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 1px, transparent 1px 4px), repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 3px), linear-gradient(#CDD0D4, #9DA1A6)',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        // Subtle CRT brightness hiccups.
        flicker: {
          '0%, 40%, 44%, 77%, 81%, 100%': { opacity: '1' },
          '42%': { opacity: '0.82' },
          '79%': { opacity: '0.9' },
        },
        'scan-roll': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        // Glitch slices for ::before / ::after copies. Collapsed (invisible) most of the loop,
        // then a few hard-cut frames.
        'glitch-idle-a': {
          '0%, 86%, 100%': { clipPath: 'inset(50% 0 50% 0)', transform: 'translate(0,0)' },
          '88%': { clipPath: 'inset(12% 0 70% 0)', transform: 'translate(-4px,0)' },
          '91%': { clipPath: 'inset(55% 0 25% 0)', transform: 'translate(3px,0)' },
          '94%': { clipPath: 'inset(80% 0 4% 0)', transform: 'translate(-2px,0)' },
        },
        'glitch-idle-b': {
          '0%, 70%, 100%': { clipPath: 'inset(50% 0 50% 0)', transform: 'translate(0,0)' },
          '72%': { clipPath: 'inset(65% 0 10% 0)', transform: 'translate(4px,0)' },
          '75%': { clipPath: 'inset(20% 0 60% 0)', transform: 'translate(-3px,0)' },
        },
        'glitch-a': {
          '0%': { clipPath: 'inset(10% 0 78% 0)', transform: 'translate(-5px,0)' },
          '20%': { clipPath: 'inset(58% 0 22% 0)', transform: 'translate(5px,0)' },
          '40%': { clipPath: 'inset(32% 0 48% 0)', transform: 'translate(-3px,0)' },
          '60%': { clipPath: 'inset(82% 0 3% 0)', transform: 'translate(4px,0)' },
          '80%': { clipPath: 'inset(44% 0 40% 0)', transform: 'translate(-6px,0)' },
          '100%': { clipPath: 'inset(5% 0 85% 0)', transform: 'translate(2px,0)' },
        },
        'glitch-b': {
          '0%': { clipPath: 'inset(70% 0 12% 0)', transform: 'translate(5px,0)' },
          '25%': { clipPath: 'inset(15% 0 62% 0)', transform: 'translate(-5px,0)' },
          '50%': { clipPath: 'inset(40% 0 35% 0)', transform: 'translate(3px,0)' },
          '75%': { clipPath: 'inset(2% 0 88% 0)', transform: 'translate(-4px,0)' },
          '100%': { clipPath: 'inset(60% 0 25% 0)', transform: 'translate(6px,0)' },
        },
        // Chromatic aberration (inherited text-shadow) during the overload.
        aberration: {
          '0%, 100%': { textShadow: '-2px 0 #EE0787, 2px 0 #00F0FF' },
          '33%': { textShadow: '3px 0 #EE0787, -3px 0 #00F0FF' },
          '66%': { textShadow: '-1px 1px #EE0787, 1px -1px #00F0FF' },
        },
        shake: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '20%': { transform: 'translate(-5px,2px) rotate(-0.4deg)' },
          '40%': { transform: 'translate(4px,-3px) rotate(0.4deg)' },
          '60%': { transform: 'translate(-3px,-1px)' },
          '80%': { transform: 'translate(5px,3px) rotate(0.3deg)' },
        },
        flash: {
          '0%, 22%, 48%, 100%': { opacity: '0' },
          '8%': { opacity: '0.9' },
          '34%': { opacity: '0.6' },
          '58%': { opacity: '0.35' },
        },
        'spark-fly': {
          '0%': { transform: 'translateY(0) scaleY(1)', opacity: '1' },
          '100%': { transform: 'translateY(-150px) scaleY(0.25)', opacity: '0' },
        },
        strobe: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        'static-noise': {
          '0%': { backgroundPosition: '0 0' },
          '25%': { backgroundPosition: '-40px 30px' },
          '50%': { backgroundPosition: '25px -45px' },
          '75%': { backgroundPosition: '-15px -20px' },
          '100%': { backgroundPosition: '35px 15px' },
        },
        // Hazard barrier snaps at its centre seam and each half falls away.
        'barrier-snap-l': {
          '0%': { transform: 'translate(0,0) rotate(0deg)', opacity: '1' },
          '18%': { transform: 'translate(-6px,3px) rotate(-3deg)', opacity: '1' },
          '100%': { transform: 'translate(-140%,240%) rotate(-38deg)', opacity: '0' },
        },
        'barrier-snap-r': {
          '0%': { transform: 'translate(0,0) rotate(0deg)', opacity: '1' },
          '18%': { transform: 'translate(6px,-3px) rotate(3deg)', opacity: '1' },
          '100%': { transform: 'translate(140%,260%) rotate(42deg)', opacity: '0' },
        },
        // Hard-stepped left-to-right reveal, like a terminal printing the line.
        reveal: {
          '0%': { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        stamp: {
          '0%': { transform: 'scale(1.8) rotate(-2deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(-2deg)', opacity: '1' },
        },
        drip: {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'hazard-scroll': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '19.8px 0' },
        },
        // One stripe period of bg-hazard-lg along x: 24px * sqrt(2).
        'hazard-scroll-lg': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '33.94px 0' },
        },
        // Padlock: yellow glow with occasional RGB-split hiccups.
        'lock-glitch': {
          '0%, 88%, 100%': { filter: 'drop-shadow(0 0 10px rgba(238,195,36,0.55))', transform: 'translate(0,0)' },
          '90%': { filter: 'drop-shadow(-3px 0 0 #EE0787) drop-shadow(3px 0 0 #00F0FF)', transform: 'translate(2px,0)' },
          '93%': { filter: 'drop-shadow(3px 0 0 #EE0787) drop-shadow(-3px 0 0 #00F0FF)', transform: 'translate(-3px,1px)' },
          '96%': { filter: 'drop-shadow(0 0 14px rgba(238,195,36,0.9))', transform: 'translate(1px,-1px)' },
        },
        'lock-glitch-hard': {
          '0%': { filter: 'drop-shadow(-4px 0 0 #EE0787) drop-shadow(4px 0 0 #00F0FF)', transform: 'translate(-3px,0)' },
          '33%': { filter: 'drop-shadow(4px 0 0 #EE0787) drop-shadow(-4px 0 0 #00F0FF)', transform: 'translate(3px,-1px)' },
          '66%': { filter: 'drop-shadow(0 0 18px rgba(254,124,0,0.95))', transform: 'translate(-1px,2px)' },
        },
        // Shackle lifts out of the body, then swings open around its right leg.
        'shackle-open': {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '45%': { transform: 'translateY(-9px) rotate(0deg)' },
          '100%': { transform: 'translateY(-9px) rotate(32deg)' },
        },
        'lock-drop': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(170px) rotate(28deg)', opacity: '0' },
        },
        'cursor-tap': {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '40%, 60%': { transform: 'translate(-10px,-12px) scale(1)' },
          '50%': { transform: 'translate(-10px,-12px) scale(0.82)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 2.4s ease-in-out infinite',
        blink: 'blink 1s steps(1) infinite',
        flicker: 'flicker 5s linear infinite',
        'scan-roll': 'scan-roll 7s linear infinite',
        'spin-slow': 'spin 90s linear infinite',
        'glitch-idle-a': 'glitch-idle-a 3.4s steps(1) infinite',
        'glitch-idle-b': 'glitch-idle-b 2.9s steps(1) infinite',
        'glitch-a': 'glitch-a 0.3s steps(1) infinite',
        'glitch-b': 'glitch-b 0.25s steps(1) infinite',
        aberration: 'aberration 0.18s steps(1) infinite',
        shake: 'shake 0.32s linear 4',
        flash: 'flash 1.3s ease-out both',
        'spark-fly': 'spark-fly 0.55s ease-out 2 both',
        strobe: 'strobe 0.5s steps(1) infinite',
        'static-noise': 'static-noise 0.3s steps(1) infinite',
        'barrier-snap-l': 'barrier-snap-l 0.85s cubic-bezier(0.5,0,0.75,0) both',
        'barrier-snap-r': 'barrier-snap-r 0.85s cubic-bezier(0.5,0,0.75,0) 0.08s both',
        'lock-glitch': 'lock-glitch 3.2s steps(1) infinite',
        'lock-glitch-hard': 'lock-glitch-hard 0.24s steps(1) infinite',
        'shackle-open': 'shackle-open 0.9s cubic-bezier(0.3,1.4,0.5,1) 0.3s both',
        'lock-drop': 'lock-drop 0.8s cubic-bezier(0.5,0,0.75,0) 0.15s both',
        'hazard-scroll-lg': 'hazard-scroll-lg 0.35s linear infinite',
        reveal: 'reveal 1.4s steps(22) both',
        stamp: 'stamp 0.28s cubic-bezier(0.2,0.8,0.3,1.4) 1.5s both',
        drip: 'drip 2.6s cubic-bezier(0.6,0,0.4,1) 0.6s both',
        'hazard-scroll': 'hazard-scroll 0.9s linear infinite',
        'cursor-tap': 'cursor-tap 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
